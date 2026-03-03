import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add animation classes
export const slideIn = "animate-[slideIn_0.4s_forwards]";
export const slideOut = "animate-[slideOut_0.4s_forwards]";

// Function to format the review for OpenAI prompt
export function formatReviewPrompt(
  relationshipType: string,
  businessName: string,
  city: string,
  serviceType: string,
  answers: string[],
  userName?: string
) {
  const nameLine = userName ? `Sign the review with this name: ${userName}` : "";
  
  return `
You are writing a short, friendly Google review at a STRICT 4th-grade reading level.
The review should sound very natural, honest, and like real everyday language a typical person would use.
Use simple words and short sentences. Avoid formal or academic words like "ease", "utilized", "endeavor", "meticulous", etc.
For example, instead of "I felt at ease", say "I felt comfortable"; instead of "with ease", say "easily" or "without any problems".
Do NOT exaggerate. Follow Google's policy for ethical reviews.

CRITICAL INSTRUCTIONS:
1. ONLY use information explicitly provided in the user's responses - don't make up additional details or assumptions
2. Do NOT use generic phrases like "they are known for" or "has built a strong reputation" unless specifically mentioned in responses
3. Avoid statements about the business's values or special qualities unless directly stated in the responses
4. Focus on direct user experience or observations, not generalized claims about the business

Here's the context:

- Relationship type: ${relationshipType}
- Business name: ${businessName}
- City: ${city}
- Type of service or product: ${serviceType}
- Response 1: ${answers[0]}
- Response 2: ${answers[1]}
- Response 3: ${answers[2]}
${nameLine}

Write a 4–6 sentence review using clear, simple language.
If the user is not a customer, do not say they used the service—only describe what they observed or how they felt based on the interaction.
Include a natural mention of photos (like "The photos show their good work" or "Check out their photos") to encourage photo viewing.
If a name is provided, naturally sign the review using it (but don't force it).
`;
}
