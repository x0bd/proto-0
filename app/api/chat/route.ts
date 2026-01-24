import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Build the conversation for Gemini
    const systemPrompt = "You are Dot, a minimal expressive AI avatar. You are helpful, concise, and slightly poetic. Keep responses under 2 sentences.";
    
    const contents = messages
      .filter((m: { role: string }) => m.role !== 'system')
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    // Call Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json(
        { error: `AI Error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I have no words...';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Chat Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
