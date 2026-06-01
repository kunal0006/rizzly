require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      config: {
        responseMimeType: "application/json",
        safetySettings: [
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          }
        ]
      }
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
