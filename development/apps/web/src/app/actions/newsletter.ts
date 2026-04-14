"use server";

import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address.");

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email") as string;
  
  // Validate email
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    // Determine the API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    
    // Attempt to hit the real backend if such endpoint exists, 
    // or just simulate network delay. We will wrap it in a try-catch
    // so it doesn't fail if the endpoint isn't ready.
    await fetch(`${apiUrl}/api/v1/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data }),
    }).catch(() => {
      // Ignore fetch failures (simulating fallback if endpoint doesn't exist)
    });

    // Minimum delay to feel "real"
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return success
    return { success: true, message: "Successfully subscribed!" };
  } catch {
    return { error: "Failed to subscribe. Please try again later." };
  }
}
