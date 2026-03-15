import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import rateLimit from "express-rate-limit";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Resend } from "resend";

// Strict auth limiter — 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Extended user schema with validation for registration
export const registerUserSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().optional(),
  company: z.string().optional(),
});

export function setupAuth(app: Express) {
  // Configure session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "supersecret", // Should be set as environment variable
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Check if login is by username or email
        let user;
        if (username.includes('@')) {
          user = await storage.getUserByEmail(username);
        } else {
          user = await storage.getUserByUsername(username);
        }
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Update last login time
        await storage.updateUser(user.id, { lastLoginAt: new Date() });
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", authLimiter, async (req, res, next) => {
    try {
      // Validate registration data
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Hash password and create user
      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password),
      });

      // Send verification email (fire-and-forget — don't block registration)
      try {
        const verificationToken = randomBytes(32).toString("hex");
        await storage.setEmailVerificationToken(user.id, verificationToken);

        const appUrl = (process.env.APP_URL || "https://ethical-review-builder.vercel.app").trim();
        const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;
        const fromEmail = (process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev").trim();

        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: `Ethical Review Builder <${fromEmail}>`,
          to: user.email,
          subject: "Verify your email address",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="margin-bottom:8px">Verify your email</h2>
              <p style="color:#555;margin-bottom:24px">
                Thanks for signing up for Ethical Review Builder!
                Click the button below to verify your email address.
              </p>
              <a href="${verifyUrl}"
                 style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
                Verify Email
              </a>
              <p style="color:#999;font-size:13px;margin-top:24px">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // Email failure should not block registration
        console.error("Failed to send verification email:", emailError);
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/login", authLimiter, (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: any, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // GET /api/verify-email?token=xxx — mark email as verified
  app.get("/api/verify-email", async (req, res, next) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Verification token is required" });
      }

      const user = await storage.getUserByEmailVerificationToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or already used verification link" });
      }

      await storage.markEmailVerified(user.id);

      // If user is already logged in, refresh their session data
      if (req.isAuthenticated() && req.user.id === user.id) {
        const updatedUser = await storage.getUser(user.id);
        if (updatedUser) {
          req.login(updatedUser, (err) => {
            if (err) console.error("Session refresh error:", err);
          });
        }
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/forgot-password — send reset email
  app.post("/api/forgot-password", authLimiter, async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      // Always return the same message to prevent email enumeration
      const genericResponse = { message: "If that email is registered, a reset link has been sent." };

      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) return res.json(genericResponse);

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await storage.setPasswordResetToken(user.id, token, expiresAt);

      const appUrl = (process.env.APP_URL || "https://ethical-review-builder.vercel.app").trim();
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      const fromEmail = (process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev").trim();

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `Ethical Review Builder <${fromEmail}>`,
        to: user.email,
        subject: "Reset your password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="margin-bottom:8px">Reset your password</h2>
            <p style="color:#555;margin-bottom:24px">
              You requested a password reset for your Ethical Review Builder account.
              Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
              Reset Password
            </a>
            <p style="color:#999;font-size:13px;margin-top:24px">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      res.json(genericResponse);
    } catch (error) {
      next(error);
    }
  });

  // POST /api/reset-password — validate token, update password
  app.post("/api/reset-password", authLimiter, async (req, res, next) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const user = await storage.getUserByPasswordResetToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset link" });
      }
      if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
        return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
      }

      const hashed = await hashPassword(password);
      await storage.updateUser(user.id, { password: hashed });
      await storage.clearPasswordResetToken(user.id);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  });
}