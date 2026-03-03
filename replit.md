# Ethical Review Builder

## Overview

The Ethical Review Builder is a full-stack web application that helps users create authentic, compliant Google reviews based on their relationship with local businesses. The app uses AI (OpenAI) to generate personalized reviews while ensuring ethical compliance with Google's review policies. It supports multiple relationship types including customers, acquaintances, and appointment interactions, guiding users through tailored questionnaires to capture genuine experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Business Profiles & Branding (January 2026)
- Added business profiles table with branding fields (logo, primaryColor, accentColor, welcomeMessage)
- Shareable review links via unique slug (e.g., /review/joes-pizza-a1b2c3)
- Public review page displays business branding with gradient header
- ReviewBuilder accepts prefillData to skip business info steps for branded pages
- ProfileSettingsDialog with tabs for branding, sharing, and embed code
- Plan-based feature gating: Free (1 profile), Pro (3 + branding), Enterprise (unlimited + embed)
- Embed tokens (64-char hex) for secure widget embedding

### Business Type Categorization (January 2026)
- Added 6 business categories: restaurant, retail, professional-services, healthcare, home-services, other
- Each category has tailored questions and vocabulary for authentic reviews
- AI prompts include category-specific guidance (e.g., restaurant reviews mention food, not installations)
- Appointment flows only available for home-services category
- Temperature lowered to 0.65 for more consistent, factual output

## System Architecture

### Frontend Architecture
- **React with TypeScript** using Vite as the build tool for fast development and optimized production builds
- **Component-based design** with reusable UI components built on Radix UI primitives and shadcn/ui
- **Mobile-first responsive design** with dedicated mobile standards and utilities for consistent touch targets and accessibility
- **State management** through React hooks and TanStack Query for server state management
- **Client-side routing** using Wouter for lightweight SPA navigation
- **Form handling** with React Hook Form and Zod validation for type-safe form management

### Backend Architecture
- **Express.js server** with TypeScript providing RESTful API endpoints
- **Session-based authentication** using Passport.js with local strategy and secure session storage
- **Multi-tenant SaaS structure** supporting user accounts, business profiles, and review templates
- **Database operations** through Drizzle ORM with PostgreSQL as the primary database
- **API integration** with OpenAI for AI-powered review generation

### Data Storage Solutions
- **PostgreSQL database** hosted on Neon for reliable cloud-based data persistence
- **Drizzle ORM** for type-safe database operations and schema management
- **Session storage** using connect-pg-simple for PostgreSQL-backed session persistence
- **Database migrations** managed through Drizzle Kit with schema versioning

### Authentication and Authorization
- **Passport.js authentication** with username/password strategy and secure password hashing using scrypt
- **Session-based security** with secure cookies and CSRF protection
- **Role-based access control** with free, pro, and enterprise plan tiers
- **Protected routes** with middleware validation for authenticated and premium features

### External Dependencies
- **OpenAI API** for generating contextual, policy-compliant review content based on user responses
- **Neon Database** as the managed PostgreSQL hosting solution
- **Google Places integration** through location input components for business discovery
- **Replit platform** integration with development tooling and deployment capabilities
- **TailwindCSS** for utility-first styling with custom design system
- **Radix UI** for accessible, unstyled component primitives