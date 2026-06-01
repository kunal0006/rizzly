import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, sampleInput } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const testInput = sampleInput || 'This is a test input. Please respond briefly to demonstrate the prompt behavior.';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${prompt}\n\n${testInput}` }] },
      ],
    });

    return NextResponse.json({
      output: response.text || 'No response generated',
    });
  } catch (error) {
    console.error('Prompt test error:', error);
    return NextResponse.json({ error: 'Failed to test prompt' }, { status: 500 });
  }
}
