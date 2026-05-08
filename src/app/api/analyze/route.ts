import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // FALLBACK MOCK IF NO API KEY
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found. Falling back to mock data.");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const smoothReplies = [
        "I know a place that makes the best margaritas. You free Thursday?",
        "You've got a great vibe. Let's grab coffee and see if it matches in person.",
        "I was going to wait a day to reply, but I'd rather just ask you out now."
      ];
      const funnyReplies = [
        "Are we going to keep aggressively agreeing with each other, or are we going to get drinks?",
        "My dog told me I should ask you out. He's usually a good judge of character.",
        "I'm legally obligated to tell you that I'm terrible at bowling before I ask you to go."
      ];
      const nonchalantReplies = [
        "Yeah I could be down. Let's see how the week goes.",
        "Sounds cool. Let me know what you end up doing.",
        "If I'm not busy taking a nap, maybe we can link."
      ];
      const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      return NextResponse.json({
        interestLevel: Math.floor(Math.random() * (98 - 75 + 1) + 75),
        interestLabel: "High",
        vibeSummary: "They're definitely engaged! The quick response times and use of emojis indicate strong interest. They're leaving the conversation open-ended, waiting for you to make a move.",
        replies: [
          { type: "🔥 Smooth", text: random(smoothReplies) },
          { type: "💀 Funny", text: random(funnyReplies) },
          { type: "🖤 Nonchalant", text: random(nonchalantReplies) }
        ]
      });
    }

    // REAL AI INTEGRATION
    const ai = new GoogleGenAI({ apiKey });
    
    // Convert File to Base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = image.type;

    const prompt = `You are an expert dating wingman and social intelligence AI. 
Analyze the provided chat screenshot. Read the conversation carefully.

Identify:
1. The interest level of the other person (0-100).
2. A short label for the interest (e.g., "High", "Medium", "Low", "Ghosted").
3. A 2-3 sentence summary of the "Vibe Check" (what's the tone, are they engaged, what's the subtext?).
4. Provide exactly 3 suggested replies for the user to send next, categorized into these three types EXACTLY:
   - "🔥 Smooth"
   - "💀 Funny"
   - "🖤 Nonchalant"

CRITICAL TONE INSTRUCTIONS FOR REPLIES:
- Keep the tone EXTREMELY casual, like Gen-Z texting. 
- Do NOT sound professional, robotic, or overly enthusiastic.
- Use all lowercase letters. No periods at the end of sentences.
- Use common texting slang where appropriate (e.g., "rn", "ngl", "fr", "wya").
- Keep replies short and punchy.

Return ONLY a valid JSON object matching this exact structure:
{
  "interestLevel": 85,
  "interestLabel": "High",
  "vibeSummary": "...",
  "replies": [
    { "type": "🔥 Smooth", "text": "..." },
    { "type": "💀 Funny", "text": "..." },
    { "type": "🖤 Nonchalant", "text": "..." }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    let jsonString = response.text;
    // Strip markdown code blocks if the model wrapped the JSON
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const analysis = JSON.parse(jsonString);
    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error("Error analyzing chat:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze chat" }, { status: 500 });
  }
}
