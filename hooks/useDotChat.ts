"use client";

import { streamText, tool, type CoreMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import type { AIConfig } from "@/app/components/CustomizationModal";
import type { EmotionState } from "@/app/components/face/types";

interface UseChatOpt {
  aiConfig: AIConfig;
  onEmotionChange: (emotion: EmotionState) => void;
}

export function useDotChat({ aiConfig, onEmotionChange }: UseChatOpt) {
  const sendMessage = async function* (
    messages: { role: string; content: string }[]
  ) {
    try {
      // Create provider from user config
      const provider = createOpenAI({
        baseURL: aiConfig.baseUrl,
        apiKey: aiConfig.baseKey,
      });

      // Convert to CoreMessage format
      const coreMessages: CoreMessage[] = [
        {
          role: "system",
          content:
            "You are Dot, a minimal expressive avatar. You are helpful, concise, and slightly poetic. Use the setEmotion tool to express your emotional state as you respond. This allows your avatar to react naturally to the conversation.",
        },
        ...messages.map((m) => ({
          role: (m.role === "dot" ? "assistant" : m.role) as "user" | "assistant" | "system",
          content: m.content,
        })),
      ];

      // Stream text with emotion tool
      const result = streamText({
        model: provider(aiConfig.model),
        messages: coreMessages,
        tools: {
          setEmotion: tool({
            description:
              "Set Dot's emotional state. Call this to express how you're feeling as you respond. You can update emotions multiple times in a conversation.",
            parameters: z.object({
              joy: z
                .number()
                .min(0)
                .max(1)
                .describe("Happiness, contentment (0-1)"),
              sadness: z.number().min(0).max(1).describe("Sorrow, melancholy (0-1)"),
              surprise: z
                .number()
                .min(0)
                .max(1)
                .describe("Astonishment, wonder (0-1)"),
              anger: z.number().min(0).max(1).describe("Frustration, irritation (0-1)"),
              curiosity: z
                .number()
                .min(0)
                .max(1)
                .describe("Interest, inquisitiveness (0-1)"),
            }),
            execute: async (emotion: EmotionState) => {
              onEmotionChange(emotion);
              return "Emotion updated";
            },
          }),
        },
        temperature: 0.7,
        maxTokens: 150,
      });

      // Stream text chunks
      for await (const chunk of result.textStream) {
        yield { type: "text" as const, content: chunk };
      }

      // Await full result for final metadata
      const fullText = await result.text;
      yield { type: "done" as const, content: fullText };
    } catch (error) {
      yield {
        type: "error" as const,
        content: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  return { sendMessage };
}
