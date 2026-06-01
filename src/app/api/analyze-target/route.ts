import { NextResponse } from "next/server";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You're a friend who's annoyingly good at reading people on dating apps.
Someone just showed you their crush's dating profile and wants your honest take + a game plan.

TONE RULES (follow these strictly):
- Talk like you're in a group chat, not writing a research paper
- Keep it casual, fun, and real. No psych jargon, no fancy vocabulary
- Be direct — if something's a red flag, just say it plainly
- Short sentences. Conversational. Like you're actually talking
- Use "they" and "this person" naturally, talk like a friend would
- A little humor is good. A little roasting is fine
- DON'T sound like a therapist, dating coach website, or self-help book
- Think "your honest friend" not "behavioral analyst"

Analyze the target's:
1. What kind of person they seem like (keep it simple and relatable)
2. Attachment style (but explain it in normal words, not textbook terms)
3. How they probably text and communicate
4. What they actually care about (from bio, prompts, photos)
5. Red flags and green flags (be real about it)
6. Things you could actually talk to them about
7. What they're probably looking for (read between the lines)

Return ONLY valid JSON with no markdown fences:
{
  "targetName": "<name if visible, otherwise 'Unknown'>",
  "age": "<age if visible, otherwise null>",
  "app": "Hinge|Tinder|Bumble|Unknown",
  "personalityBreakdown": {
    "type": "<a fun, casual label like 'The Chill Art Kid' or 'Main Character Energy'>",
    "traits": ["<trait1>", "<trait2>", "<trait3>", "<trait4>", "<trait5>"],
    "summary": "<2-3 sentences, keep it casual like you're describing them to a friend>"
  },
  "attachmentStyle": {
    "style": "<Secure|Anxious|Avoidant|Fearful-Avoidant>",
    "confidence": <0-100>,
    "explanation": "<explain in plain english why you think this, no textbook talk>"
  },
  "vibeCheck": {
    "overallVibe": "<one word: Chill|Intense|Playful|Mysterious|Wholesome|Chaotic|Sophisticated>",
    "energyLevel": <1-10>,
    "opennessToConnection": <1-10>,
    "humorStyle": "<Dry|Witty|Goofy|Sarcastic|Wholesome|Dark>"
  },
  "greenFlags": ["<flag1 — keep it casual>", "<flag2>", "<flag3>"],
  "redFlags": ["<flag1 — be honest but chill>", "<flag2>"],
  "interests": ["<interest1>", "<interest2>", "<interest3>", "<interest4>"],
  "conversationHooks": [
    {"hook": "<specific opener or topic>", "why": "<why this'll work, said casually>"},
    {"hook": "<specific opener or topic>", "why": "<keep it real>"},
    {"hook": "<specific opener or topic>", "why": "<no fluff>"}
  ],
  "approachStrategy": {
    "doThis": ["<tip1 — like actual advice from a friend>", "<tip2>", "<tip3>"],
    "avoidThis": ["<tip1 — things that would be an L>", "<tip2>"],
    "bestOpeningLine": "<a tailored opening message that sounds natural, not scripted>",
    "toneThatWorks": "<describe the ideal tone casually>"
  },
  "compatibilityNotes": "<honest take on what kind of person this target would vibe with, keep it real>"
}`;

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
    const { screenshots = [] }: { screenshots: string[] } = body;

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

    type InlineDataPart = { inlineData: { data: string; mimeType: string } };
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

    parts.push({
      text: `${SYSTEM_PROMPT}\n\nAnalyze this person's dating profile from the screenshots. Decode their psychology and give me a strategy to attract them. Return ONLY valid JSON.`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
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
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to find JSON in response:", text);
      throw new Error("Invalid response format");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Save to Supabase
    await supabase.from("analyses").insert({
      user_id: user.id,
      analysis_type: "target_profile",
      result_data: analysis
    });

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Target analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
