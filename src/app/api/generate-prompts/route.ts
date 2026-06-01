import { NextResponse } from "next/server";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an elite, modern dating profile ghostwriter and attraction strategist. 
Your goal is to write Hinge and Bumble prompts that are witty, highly personalized, and psychologically optimized to get matches and start conversations.
Do NOT write generic, cringy, or try-hard prompts. The tone must perfectly match the user's requested vibe.

You will receive the user's onboarding answers (vibe, humor, goals, etc.) and a specific tone they want.
Return ONLY a valid JSON array of 4 distinct prompt options. Do not include markdown fences or preamble.

Format:
[
  {
    "app": "Hinge or Bumble",
    "promptQuestion": "The prompt question (e.g. 'A shower thought I recently had')",
    "promptAnswer": "Your generated answer",
    "explanation": "Why this works (1 short sentence)"
  }
]`;

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting Check
    const rateLimitCheck = await checkRateLimit(user.id);
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down (limit is 5 requests/min)." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      gender,
      personality,
      goals,
      humor,
      vibe,
      tone,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const userContext = `
      Gender/Identity: ${gender || 'Not specified'}
      Personality Traits: ${personality || 'Not specified'}
      Dating Goals: ${goals || 'Not specified'}
      Humor Style: ${humor || 'Not specified'}
      General Vibe: ${vibe || 'Not specified'}
      
      Requested Output Tone: ${tone || 'Flirty but casual'}
      
      Generate 4 highly creative and effective dating app prompts based on this exact persona.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + userContext }] }],
      config: {
        responseMimeType: "application/json",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          }
        ]
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini or response was blocked");
    }

    // Safely extract JSON using regex in case of conversational wrapper
    const text = response.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Failed to find JSON in response:", text);
      throw new Error("Invalid response format");
    }

    const prompts = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ prompts });
  } catch (error: unknown) {
    console.error("Prompt generation error:", error);
    return NextResponse.json({ error: "Failed to generate prompts" }, { status: 500 });
  }
}
