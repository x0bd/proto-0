# Context-Aware Emotional Suggestions

## Strategy Overview

To implement context-aware emotions, we will bridge the gap between conversation text and the visual emotion engine using a layered approach.

### 1. The "Fast" Layer: Client-Side Sentiment Analysis
Runs instantly in the browser as the user types or sends a message. Provides immediate, visceral feedback.

*   **Mechanism**: Use a lightweight library (e.g., `sentiment`, `vader-sentiment`) to score input on a valence scale.
*   **Mapping**:
    *   **Positive Score (> 0)** → Drifts towards **Joy**.
    *   **Negative Score (< 0)** → Drifts towards **Sadness**.
    *   **High Intensity** (caps, exclamation marks) → Increases **Surprise** or **Anger**.
*   **Pros**: Zero latency, offline support, responsive feel.
*   **Cons**: Lacks nuance (e.g., sarcasm, complex negation).

### 2. The "Smart" Layer: Semantic Keyword Triggers
A dictionary of "intent keywords" mapping to complex emotions that simple sentiment analysis misses.

*   **Curiosity**: `?`, "how", "why", "what if", "tell me" → Triggers **Curiosity** (eyes widen, head tilt).
*   **Surprise**: "wow", "amazing", "incredible", "no way" → Triggers **Surprise**.
*   **Anger/Annoyance**: "stop", "bad", "wrong", "hate" → Triggers **Anger**.
*   **Implementation**: A custom hook `useEmotionAnalysis(text)` running regex matches.

### 3. The "Deep" Layer: Vercel AI SDK Integration (Future)
We will leverage the **Vercel AI SDK** (`useChat` / `streamText`) to connect the avatar to a powerful LLM backend.

*   **Mechanism**: Use **Structured Outputs** (or Tool Calling) to receive a JSON object from the LLM instead of just raw text.
*   **Data Structure**:
    ```json
    {
      "text": "I'm so sorry to hear that...",
      "emotion": "sadness",
      "intensity": 0.8,
      "action": "bow_head"
    }
    ```
*   **Benefit**: This gives the avatar a "subconscious" driven directly by the AI's intent, allowing for **Empathy** and complex emotional storytelling that simple keyword matching cannot achieve.

---

## Implementation Plan

We will start with a **Hybrid of Layers 1 & 2** for the best balance of performance and "magic".

### Step 1: `EmotionAnalyzer` Utility
Create a utility function that analyzes text and returns a target emotion state.

```typescript
type EmotionAnalysis = {
  base: 'joy' | 'sadness' | 'neutral';
  intensity: number; // 0 to 1
  special?: 'curiosity' | 'surprise' | 'anger';
}

function analyzeText(text: string): EmotionAnalysis {
  // 1. Calculate Sentiment Score (Joy vs Sadness)
  // 2. Check Keyword Heuristics (Curiosity, Surprise)
  // 3. Return combined state
}
```

### Step 2: Integration with `ChatWindow`
When the user sends a message:
1.  Run `analyzeText(userMessage)`.
2.  Call `setEmotion()` on the Avatar to morph the face immediately.
3.  (Optional) Hardcode emotional tags in demo responses to show the avatar reacting to its *own* words.

### Step 3: Visual Feedback
*   **Implicit**: The face simply changes as you type or send (most immersive).
*   **Explicit**: Show a small "detected emotion" icon that can be clicked or overridden.
