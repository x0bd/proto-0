import { NextResponse } from 'next/server';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function callGemini(apiKey: string, contents: any[], systemPrompt: string, attempt: number = 1): Promise<Response> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
          maxOutputTokens: 80, // Reduced for faster responses and lower quota usage
        },
      }),
    }
  );

  // If rate limited (429), retry with exponential backoff
  if (response.status === 429 && attempt < MAX_RETRIES) {
    const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
    console.log(`Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return callGemini(apiKey, contents, systemPrompt, attempt + 1);
  }

  return response;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY not configured. Add it to .env.local' },
        { status: 500 }
      );
    }

    // Tighter system prompt for shorter responses
    const systemPrompt = "You are Dot. Reply in 1 sentence max. Be poetic but brief.";
    
    // Only keep last 4 messages to reduce token usage
    const recentMessages = messages.slice(-4);
    
    const contents = recentMessages
      .filter((m: { role: string }) => m.role !== 'system')
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    const response = await callGemini(apiKey, contents, systemPrompt);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      
      // User-friendly error messages
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit reached. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `AI Error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '...';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Chat Error:', error);
    return NextResponse.json(
      { error: 'Connection failed. Check your API key.' },
      { status: 500 }
    );
  }
}
