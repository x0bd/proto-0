"use client";

import { streamText, type CoreMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
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
      let model;
      
      // Smart Provider Selection
      const isGoogle = aiConfig.baseUrl.includes("generativelanguage.googleapis.com") || aiConfig.baseUrl === "";
      
      if (isGoogle) {
          const google = createGoogleGenerativeAI({
            apiKey: aiConfig.apiKey,
          });
          model = google(aiConfig.model || "gemini-1.5-flash");
      } else {
          // Custom OpenAI-compatible provider
          const openai = createOpenAI({
            baseURL: aiConfig.baseUrl,
            apiKey: aiConfig.apiKey,
            // @ts-ignore - Required for client-side usage with user keys
            dangerouslyAllowBrowser: true,
          });
          model = openai(aiConfig.model);
      }

      // Stream text with emotion tool
      const result = streamText({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are Dot, a minimal expressive avatar. You are helpful, concise, and slightly poetic. Use the setEmotion tool to express your emotional state as you respond. This allows your avatar to react naturally to the conversation.",
          },
          ...messages.map((m) => ({
            role: (m.role === "dot" ? "assistant" : m.role) as "user" | "assistant" | "system",
            content: m.content,
          })),
        ],
        tools: {
          setEmotion: {
            description:
              "Set Dot's emotional state. Call this to express how you're feeling as you respond. You can update emotions multiple times in a conversation.",
            parameters: z.object({
              joy: z.number().min(0).max(1).describe("Happiness (0-1)"),
              sadness: z.number().min(0).max(1).describe("Sadness (0-1)"),
              surprise: z.number().min(0).max(1).describe("Surprise (0-1)"),
              anger: z.number().min(0).max(1).describe("Anger (0-1)"),
              curiosity: z.number().min(0).max(1).describe("Curiosity (0-1)"),
            }),
          } as any,
        },
        temperature: 0.7,
      });

      // Stream full response (text + tool calls)
      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          yield { type: "text" as const, content: part.text };
        }
        if (part.type === 'tool-call' && part.toolName === 'setEmotion') {
          const emotion = (part as any).args as EmotionState;
          onEmotionChange(emotion);
        }
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
