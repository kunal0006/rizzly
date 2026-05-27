import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are a world-class dating psychologist and behavioral analyst. 
A user has uploaded screenshots of someone else's dating profile (their "target" / crush / match).
Your job is to psychologically decode this person and provide the user with a personalized strategy to attract them.

Analyze the target's:
1. Personality type (extravert/introvert, spontaneous/planner, etc.)
2. Attachment style (secure, anxious, avoidant, fearful-avoidant)
3. Communication style (texter/caller, emoji user, response patterns)
4. Core values (from bio, prompts, photos)
5. Red flags and green flags
6. Likely interests and conversation hooks
7. What they're ACTUALLY looking for (read between the lines)

Return ONLY valid JSON with no markdown fences:
{
  "targetName": "<name if visible, otherwise 'Unknown'>",
  "age": "<age if visible, otherwise null>",
  "app": "Hinge|Tinder|Bumble|Unknown",
  "personalityBreakdown": {
    "type": "<e.g. 'The Adventurous Intellectual'>",
    "traits": ["<trait1>", "<trait2>", "<trait3>", "<trait4>", "<trait5>"],
    "summary": "<2-3 sentence personality read>"
  },
  "attachmentStyle": {
    "style": "<Secure|Anxious|Avoidant|Fearful-Avoidant>",
    "confidence": <0-100>,
    "explanation": "<why you think this>"
  },
  "vibeCheck": {
    "overallVibe": "<one word: Chill|Intense|Playful|Mysterious|Wholesome|Chaotic|Sophisticated>",
    "energyLevel": <1-10>,
    "opennessToConnection": <1-10>,
    "humorStyle": "<Dry|Witty|Goofy|Sarcastic|Wholesome|Dark>"
  },
  "greenFlags": ["<flag1>", "<flag2>", "<flag3>"],
  "redFlags": ["<flag1>", "<flag2>"],
  "interests": ["<interest1>", "<interest2>", "<interest3>", "<interest4>"],
  "conversationHooks": [
    {"hook": "<specific opener or topic>", "why": "<why this will work>"},
    {"hook": "<specific opener or topic>", "why": "<why this will work>"},
    {"hook": "<specific opener or topic>", "why": "<why this will work>"}
  ],
  "approachStrategy": {
    "doThis": ["<tip1>", "<tip2>", "<tip3>"],
    "avoidThis": ["<tip1>", "<tip2>"],
    "bestOpeningLine": "<a tailored opening message>",
    "toneThatWorks": "<description of ideal tone>"
  },
  "compatibilityNotes": "<honest assessment of what kind of person this target would vibe with>"
}`;

export async function POST(request: Request) {
  try {
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
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    let jsonString = response.text.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    const analysis = JSON.parse(jsonString);
    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Target analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
