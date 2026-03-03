
# Project Summary: Ethical Review Builder

## Overview
This app helps users quickly and ethically write 5-star Google reviews based on their relationship with a local business. It uses a simple one-question-at-a-time interface and integrates OpenAI’s API to generate thoughtful, 4th-grade reading level, SEO-optimized reviews. Users can copy and paste their review directly into Google.

## Goals
- Keep the app simple and fast (under 2 minutes to complete).
- Ensure all reviews are compliant with Google’s policies.
- Help users feel confident leaving a review—even if they haven’t used the service yet.
- Automatically optimize reviews for local SEO (using business name, location, and service keywords).
- Minimize technical complexity—use the tools Replit is best suited for.

## User Experience (UX) Flow
The app follows a clean 9-screen flow:

### 1. Welcome Screen
- CTA: “Get Started”

### 2. Select Relationship Type
- Options:
  - I’ve been a customer
  - I know or follow the business
  - I scheduled an appointment

### 3. Business Info Input
- Business Name
- City or Location
- Service or Product

### 4–6. One Question at a Time (Dynamic)
- Questions adapt based on relationship type
- Three total questions per flow

### 7. Review Generation (AI)
- App composes a full review using the user’s answers and OpenAI API

### 8. Review Preview
- User can approve or edit the generated review

### 9. Review Completion
- User can copy the review and open the Google page to paste it

## User Types Supported
- Customer: Has used the service or purchased a product
- Acquaintance: Knows or follows the business
- Appointment Setter: Has scheduled or spoken with someone from the business

## Key Features
- One-question-at-a-time UX
- Dynamic question logic
- Simple text input for non-technical users
- AI-generated review in natural tone
- Reviews aligned with Google’s written guidelines
- Automatically includes local keywords for SEO
- Copy-to-clipboard functionality for easy pasting into Google
- Clean mobile-first design

## AI Integration

### Review Generation Uses OpenAI API:
- Uses Chat Completions endpoint (GPT-3.5 or GPT-4)
- Prompt includes:
  - Relationship type
  - Business name, city, service
  - User answers to 3 questions
- Output format:
  - 4th-grade reading level
  - 4–6 sentences
  - Clear, positive tone
  - SEO keywords added naturally
  - Never claims service was used if it wasn’t

## Suggested Implementation Notes (For Replit Team)
We are flexible on implementation methods and invite Replit to choose **whichever frontend, backend, and database setup best aligns with your strengths and supported tools**.

That said, we recommend:
- A single-page application (SPA) style flow to reduce loading
- A form-style interface that uses conditional logic to display one screen at a time
- Local or lightweight database to store answers temporarily, if needed
- Use Replit’s Secrets Manager for secure OpenAI key handling
- Feel free to implement backend API logic using any stack Replit supports natively

## Files Expected in Initial Build
- index.html — base UI structure
- style.css — basic styles for a clean, mobile-friendly layout
- script.js — handles question flow, review generation, and AI integration
- promptTemplate.js or equivalent — builds dynamic prompt string for OpenAI API
- .replit and replit.nix — for environment configuration
- README.md — optional onboarding instructions

## Optional Enhancements for Future Versions
- Add voice-to-text input
- Save review history (per user session)
- Multi-language support
- Admin dashboard to monitor usage or performance
- Integration with Google Places API for business name validation (later phase)

## OpenAI Prompt Template
```
You are writing a short, friendly Google review at a 4th-grade reading level.  
The review should sound natural, honest, and based on a real interaction.  
Do NOT exaggerate. Follow Google’s policy for ethical reviews.

Here’s the context:

- Relationship type: {{relationship_type}}  
- Business name: {{business_name}}  
- City: {{city}}  
- Type of service or product: {{service_type}}  
- Response 1: {{q1}}  
- Response 2: {{q2}}  
- Response 3: {{q3}}  

Write a 4–6 sentence review using clear, simple language.  
If the user is not a customer, do not say they used the service—only describe what they observed or how they felt based on the interaction.
```

## Final Note to Replit Developers
This is a purpose-driven tool to empower non-technical users to leave honest, ethical reviews that support local businesses. We want this experience to feel *fast, helpful, and human*. Please keep simplicity at the heart of every feature.

If anything is unclear, feel free to contact the project owner for clarification or vision alignment.
