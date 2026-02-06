import { ExerciseType, Difficulty, Tone } from "../enums";

const apiKey = process.env.DEEPSEEK_API_KEY || "DUMMY_KEY";

if (!process.env.DEEPSEEK_API_KEY) {
  console.warn("DEEPSEEK_API_KEY not set. API calls will fail or use mocks.");
}

const getPrompt = (
  exerciseType: ExerciseType,
  difficulty: Difficulty,
  tone: Tone,
  theme: string,
  amount: number,
  focusVocabulary: string[],
  inclusionRate: number,
  focusGrammar: string[],
  grammarInclusionRate: number
) => {
  let prompt = `Generate ${amount} English exercises.
  Type: ${exerciseType}
  Difficulty: ${difficulty}
  Tone: ${tone}
  Theme: ${theme}

  Return ONLY valid JSON.
  Structure: Array of objects.
  `;

  // Simplified prompt construction for DeepSeek, assuming it follows instructions well.
  // We reuse the logic from other services conceptually but keep it concise for the prompt.

  if (focusVocabulary.length) prompt += `\nFocus Vocab: ${focusVocabulary.join(', ')} (${inclusionRate}%)`;
  if (focusGrammar.length) prompt += `\nFocus Grammar: ${focusGrammar.join(', ')} (${grammarInclusionRate}%)`;

  prompt += `\n\nProvide the output in a JSON format compatible with the application's schema.`;

  return prompt;
};

export const generateExercises = async (
  exerciseType: ExerciseType,
  difficulty: Difficulty,
  tone: Tone,
  theme: string,
  amount: number,
  focusVocabulary: string[],
  inclusionRate: number,
  focusGrammar: string[],
  grammarInclusionRate: number
) => {
  if (!process.env.DEEPSEEK_API_KEY) {
     // Dummy fallback
     return Array.from({ length: amount }).map((_, i) => ({
        question: `DeepSeek Dummy Question #${i}`,
        answer: "Dummy",
        wordBank: ["Dummy", "Fake"]
     }));
  }

  try {
    const prompt = getPrompt(exerciseType, difficulty, tone, theme, amount, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`DeepSeek API Error: ${response.statusText}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content from DeepSeek");

    const parsed = JSON.parse(content);
    // Handle both wrapped { result: [...] } and direct [...] arrays
    return Array.isArray(parsed) ? parsed : (parsed.result || [parsed]);

  } catch (error) {
    console.error("DeepSeek generation error:", error);
    return { error: "DeepSeek generation failed." };
  }
};
