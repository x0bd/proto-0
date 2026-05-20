import type { EmotionState } from "@/app/components/face/types";

export const NEUTRAL_EMOTION: EmotionState = {
  joy: 0.3,
  sadness: 0,
  surprise: 0,
  anger: 0,
  curiosity: 0.2,
};

export function emotionFromText(text: string): EmotionState {
  const lower = text.toLowerCase();
  let joy = 0;
  let sadness = 0;
  let surprise = 0;
  let anger = 0;
  let curiosity = 0;

  const score = (words: string[], amount: number) => {
    let total = 0;
    words.forEach((word) => {
      if (lower.includes(word)) total += amount;
    });
    return total;
  };

  joy += score(
    ["happy", "great", "love", "wonderful", "beautiful", "warm", "smile", "laugh", "glad", "brilliant", "fun", "hope", "joy", "excited", "yes"],
    0.24,
  );
  sadness += score(
    ["sad", "sorry", "miss", "lost", "pain", "hurt", "alone", "heavy", "grief", "tired", "empty", "afraid"],
    0.28,
  );
  surprise += score(
    ["wow", "unexpected", "sudden", "surprise", "amazing", "incredible", "whoa", "wild"],
    0.28,
  );
  curiosity += score(
    ["wonder", "curious", "think", "reflect", "question", "consider", "imagine", "perhaps", "maybe", "why", "how"],
    0.22,
  );
  anger += score(
    ["frustrat", "angry", "annoy", "hate", "rage", "furious", "broken", "awful", "terrible", "wtf"],
    0.28,
  );

  if (text.includes("?")) curiosity += 0.25;
  if (text.includes("!")) {
    surprise += 0.14;
    joy += 0.08;
  }

  joy = Math.min(1, joy);
  sadness = Math.min(1, sadness);
  surprise = Math.min(1, surprise);
  anger = Math.min(1, anger);
  curiosity = Math.min(1, curiosity);

  if (joy < 0.08 && sadness < 0.08 && surprise < 0.08 && anger < 0.08 && curiosity < 0.08) {
    return NEUTRAL_EMOTION;
  }

  return { joy, sadness, surprise, anger, curiosity };
}
