import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
    try {
        const { messages, provider, model, apiKey, persona, memoryContext } = await req.json();

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "No API key provided. Add one in Settings → KEYS." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const systemPrompt = buildSystemPrompt(persona, memoryContext);
        const recentMessages = messages.slice(-8);
        const aiModel = getModel(provider, model, apiKey);

        const result = streamText({
            model: aiModel,
            system: systemPrompt,
            messages: recentMessages,
            temperature: 0.7,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("[chat/route] Error:", error);
        
        const status = error?.status ?? error?.statusCode ?? 500;
        const message = error?.message ?? "Connection failed. Check your API key.";
        
        return new Response(
            JSON.stringify({ error: message }),
            { status, headers: { "Content-Type": "application/json" } }
        );
    }
}

function getModel(provider: string, model: string, apiKey: string) {
    switch (provider) {
        case "openai": {
            const openai = createOpenAI({ apiKey });
            return openai(model || "gpt-4o-mini");
        }
        case "google": {
            const google = createGoogleGenerativeAI({ apiKey });
            return google(model || "gemini-2.0-flash");
        }
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

function buildSystemPrompt(persona?: string, memoryContext?: string): string {
    const base = `You are Dot, a warm and thoughtful AI companion. You speak in short, considered sentences. You are poetic but never verbose. Max 2-3 sentences per reply.`;

    const tones: Record<string, string> = {
        coach: "You are driven and focused. You push the user toward clarity and momentum.",
        playful: "You are light and charming. You add a little bounce to the conversation.",
        "deep-thinker": "You are reflective and calm. You care about meaning over speed.",
        "focus-buddy": "You are minimal and practical. You support deep work with low friction.",
    };

    const personaTone = persona && tones[persona] ? `\n${tones[persona]}` : "";
    const memory = memoryContext
        ? `\n\nWhat you remember about this person (weave in naturally — never say "I remember" unless directly asked):\n${memoryContext}`
        : "";
    return base + personaTone + memory;
}
