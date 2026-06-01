import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You're basically a dating app wingman who's really good at this stuff. You know Tinder, Hinge, and Bumble inside out.
Look at all the uploaded images — profile screenshots AND individual photos.

TONE RULES (this is important):
- Write like you're texting a friend, not writing an essay
- Keep it casual and real. No fancy words, no corporate speak
- Be direct and a little cheeky — like a buddy roasting your profile over beers
- Short sentences. Punchy. No fluff
- Use "you" and "your" a lot, talk TO the person
- It's okay to be a bit blunt — that's what makes it helpful
- DON'T sound like a therapist, professor, or LinkedIn post
- Think "group chat energy" not "TED talk energy"

Return ONLY valid JSON with no markdown fences or preamble:
{"app":"Hinge|Tinder|Bumble|Unknown","score":<0-100>,"grade":"<A+/A/B+/B/C/D/F>",
"summary":"<one sharp punchy sentence — like something you'd text your friend>",
"bio":{"score":<0-100>,"feedback":"<keep it real and specific, talk like a friend>","rewrite":"<improved bio>"},
"photos":{"score":<0-100>,"feedback":"<casual photo advice, no jargon>","tips":["<tip1>","<tip2>","<tip3>"]},
"prompts":{"score":<0-100>,"feedback":"<honest take, keep it chill>","rewrite":"<improved prompt>"},
"actions":[
  {"priority":"high","action":"<action — short and direct>","impact":"<why it matters, casually>"},
  {"priority":"high","action":"<action>","impact":"<result>"},
  {"priority":"medium","action":"<action>","impact":"<result>"}
],
"appTips":["<platform tip 1>","<platform tip 2>"]}`;

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
      screenshots = [],
      photos = [],
      app = null,
    }: { screenshots: string[]; photos: string[]; app: string | null } = body;

    if (screenshots.length === 0) {
      return NextResponse.json(
        { error: "At least one screenshot is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Helper to strip data URL prefix and get raw base64
    const stripDataUrl = (dataUrl: string): string => {
      if (dataUrl.includes(",")) return dataUrl.split(",")[1];
      return dataUrl;
    };

    const getMimeType = (
      dataUrl: string
    ): "image/jpeg" | "image/png" | "image/webp" => {
      if (dataUrl.startsWith("data:image/png")) return "image/png";
      if (dataUrl.startsWith("data:image/webp")) return "image/webp";
      return "image/jpeg";
    };

    // Build parts array: all images first, then the text prompt
    type InlineDataPart = {
      inlineData: { data: string; mimeType: string };
    };
    type TextPart = { text: string };
    type Part = InlineDataPart | TextPart;

    const parts: Part[] = [];

    for (const screenshot of screenshots) {
      parts.push({
        inlineData: {
          data: stripDataUrl(screenshot),
          mimeType: getMimeType(screenshot),
        },
      });
    }

    for (const photo of photos) {
      parts.push({
        inlineData: {
          data: stripDataUrl(photo),
          mimeType: getMimeType(photo),
        },
      });
    }

    const appHint = app
      ? `\n\nThe user believes they are on ${app}. Use this as a hint but still auto-detect from the screenshots.`
      : "";

    parts.push({
      text: `${SYSTEM_PROMPT}\n\nPlease analyse my dating profile from these screenshots and photos.${appHint} Return ONLY valid JSON.`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        safetySettings: [
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          }
        ]
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini or response was blocked");
    }

    // Safely extract JSON using regex in case of conversational wrapper
    const text = response.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to find JSON in response:", text);
      throw new Error("Invalid response format");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Save to Supabase
    await supabase.from("analyses").insert({
      user_id: user.id,
      analysis_type: "self_profile",
      result_data: analysis
    });

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Profile analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
