import { GenerateReviewRequest } from "./types";

export async function generateReview(params: GenerateReviewRequest): Promise<string> {
  try {
    const response = await fetch("/api/generate-review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error("Error generating review:", error);
    throw error;
  }
}
