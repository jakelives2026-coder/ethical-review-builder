export default function PrivacyPage() {
  const lastUpdated = "March 13, 2026";
  const contactEmail = "privacy@ethicalreviewbuilder.com";
  const appName = "Ethical Review Builder";
  const companyName = "Ethical Review Builder";
  const appUrl = "https://ethicalreviewbuilder.com";

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed">

        <section>
          <p className="text-muted-foreground">
            This Privacy Policy describes how {companyName} ("{appName}", "we", "us", or "our")
            collects, uses, and shares information when you use our AI-powered review generation
            platform at <span className="font-medium">{appUrl}</span>. By using the service you
            agree to the practices described below.
          </p>
        </section>

        {/* 1 — Data We Collect */}
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-1">Account information</h3>
              <p>When you register we collect your name, email address, username, and password
              (stored as a one-way hash). You may optionally provide a company name.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Business profile data</h3>
              <p>To personalise generated reviews we collect your business name, location,
              service category, and the name of a representative or team member.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Review inputs</h3>
              <p>We collect the answers you provide to our guided questionnaire (relationship to
              the business, experience details, etc.) and the AI-generated review text that
              results from those answers.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Payment information</h3>
              <p>If you subscribe to a paid plan, payment details (card number, billing address)
              are collected and processed by Stripe. We store only your Stripe customer ID and
              subscription status — we never see or store your full card number.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Usage and log data</h3>
              <p>We automatically collect standard server logs including IP address, browser
              type, pages visited, and timestamps. This data is used for security monitoring
              and service improvement.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Cookies and sessions</h3>
              <p>We use a single session cookie to keep you logged in between visits. We do not
              use advertising or tracking cookies. See Section 6 for more detail.</p>
            </div>
          </div>
        </section>

        {/* 2 — How We Use It */}
        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>To create and maintain your account and authenticate you securely.</li>
            <li>To generate AI-powered review drafts based on your questionnaire answers.</li>
            <li>To send transactional emails: email verification, password resets, and
                billing receipts.</li>
            <li>To process payments and manage your subscription.</li>
            <li>To improve the service, diagnose technical problems, and prevent abuse.</li>
            <li>To comply with legal obligations and enforce our Terms of Service.</li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            We do not sell your personal data. We do not use your data to train AI models.
          </p>
        </section>

        {/* 3 — Third-Party Services */}
        <section>
          <h2 className="text-xl font-semibold mb-3">3. Third-Party Services</h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-1">OpenAI</h3>
              <p>Your questionnaire answers are sent to OpenAI's API to generate review text.
              OpenAI may process this data in accordance with their
              {" "}<a href="https://openai.com/policies/privacy-policy" target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground">
                Privacy Policy
              </a>. We use the API with data-retention settings that minimise data storage
              on OpenAI's side. Your inputs are not used to train OpenAI's models under
              current API terms.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Stripe</h3>
              <p>Payments are handled by Stripe, Inc. When you enter payment information you
              are interacting directly with Stripe's secure environment. Their
              {" "}<a href="https://stripe.com/privacy" target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground">
                Privacy Policy
              </a>{" "}governs how they handle your payment data.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Resend</h3>
              <p>Transactional emails (verification, password reset) are delivered via Resend.
              Your email address and the email content are transmitted to Resend for this
              purpose. See their
              {" "}<a href="https://resend.com/legal/privacy-policy" target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground">
                Privacy Policy
              </a>.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Neon (database hosting)</h3>
              <p>Your account and review data is stored in a PostgreSQL database hosted by Neon.
              Data is encrypted at rest and in transit. See
              {" "}<a href="https://neon.tech/privacy-policy" target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground">
                Neon's Privacy Policy
              </a>.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Vercel (hosting)</h3>
              <p>The application is hosted on Vercel. Server logs and request metadata may pass
              through Vercel's infrastructure. See
              {" "}<a href="https://vercel.com/legal/privacy-policy" target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground">
                Vercel's Privacy Policy
              </a>.</p>
            </div>
          </div>
        </section>

        {/* 4 — Data Sharing */}
        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
          <p className="text-muted-foreground mb-3">
            We share your data only in the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><span className="font-medium text-foreground">Service providers</span> — the
                third-party services listed in Section 3, solely to operate the service.</li>
            <li><span className="font-medium text-foreground">Legal requirements</span> — if
                required by law, court order, or to protect the rights and safety of our users.</li>
            <li><span className="font-medium text-foreground">Business transfers</span> — if
                we merge with or are acquired by another company, your data may transfer as
                part of that transaction. We will notify you in advance.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            We do not sell, rent, or trade your personal information to any third party.
          </p>
        </section>

        {/* 5 — Your Rights */}
        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
          <p className="text-muted-foreground mb-3">
            Depending on your location you may have the following rights regarding your
            personal data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><span className="font-medium text-foreground">Access</span> — request a copy
                of the data we hold about you.</li>
            <li><span className="font-medium text-foreground">Correction</span> — ask us to
                correct inaccurate or incomplete data.</li>
            <li><span className="font-medium text-foreground">Deletion</span> — request that
                we delete your account and associated data.</li>
            <li><span className="font-medium text-foreground">Portability</span> — receive
                your data in a structured, machine-readable format.</li>
            <li><span className="font-medium text-foreground">Objection</span> — object to
                processing based on legitimate interests.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            To exercise any of these rights, email us at{" "}
            <a href={`mailto:${contactEmail}`}
               className="underline underline-offset-2 hover:text-foreground">
              {contactEmail}
            </a>. We will respond within 30 days.
          </p>
        </section>

        {/* 6 — Cookies */}
        <section>
          <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>We use one first-party session cookie named <code className="bg-muted px-1 py-0.5 rounded text-xs">connect.sid</code> to maintain your
            login session. This cookie is:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Strictly necessary — the service cannot function without it.</li>
              <li>Set to expire after 7 days of inactivity.</li>
              <li>Transmitted over HTTPS only (Secure flag).</li>
              <li>Not accessible to JavaScript (HttpOnly flag).</li>
            </ul>
            <p className="mt-2">We do not use analytics, advertising, or tracking cookies.</p>
          </div>
        </section>

        {/* 7 — Data Retention */}
        <section>
          <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
          <p className="text-muted-foreground">
            We retain your account data for as long as your account is active. If you delete
            your account, we will delete your personal data within 30 days, except where
            retention is required by law (e.g. tax records related to paid transactions, which
            are retained for up to 7 years). Anonymised usage statistics may be retained
            indefinitely.
          </p>
        </section>

        {/* 8 — Security */}
        <section>
          <h2 className="text-xl font-semibold mb-3">8. Security</h2>
          <p className="text-muted-foreground">
            We implement industry-standard safeguards including HTTPS encryption in transit,
            bcrypt-equivalent password hashing (scrypt), encrypted database storage, and
            short-lived password reset tokens. No method of transmission or storage is 100%
            secure. If you discover a security vulnerability, please disclose it responsibly
            to <a href={`mailto:${contactEmail}`}
                  className="underline underline-offset-2 hover:text-foreground">
              {contactEmail}
            </a>.
          </p>
        </section>

        {/* 9 — Children */}
        <section>
          <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
          <p className="text-muted-foreground">
            {appName} is not directed to children under 16. We do not knowingly collect
            personal data from children. If you believe a child has provided us with personal
            data, please contact us and we will delete it promptly.
          </p>
        </section>

        {/* 10 — Changes */}
        <section>
          <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. When we do, we will revise
            the "Last updated" date at the top of this page. For material changes, we will
            notify registered users by email at least 14 days before the change takes effect.
            Continued use of the service after the effective date constitutes acceptance of
            the updated policy.
          </p>
        </section>

        {/* 11 — Contact */}
        <section>
          <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions or concerns about this Privacy Policy or how we handle your
            data, please contact us:
          </p>
          <div className="mt-3 p-4 bg-muted/40 rounded-md text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{companyName}</p>
            <p>
              Email:{" "}
              <a href={`mailto:${contactEmail}`}
                 className="underline underline-offset-2 hover:text-foreground">
                {contactEmail}
              </a>
            </p>
            <p>Website: <span className="font-medium">{appUrl}</span></p>
          </div>
        </section>

      </div>
    </div>
  );
}
