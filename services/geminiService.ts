import { GoogleGenAI, Modality, Type, Schema } from "@google/genai";
import { ExerciseType, Difficulty, Tone } from "../types";

// Ensure API_KEY is set in the environment
const apiKey = process.env.API_KEY || "DUMMY_KEY_FOR_VERIFICATION";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail or be mocked.");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Constructs the prompt and schema for exercise generation based on input parameters.
 * Enforces CEFR guidelines and strict American English.
 */
const getPromptAndSchema = (exerciseType: ExerciseType, difficulty: Difficulty, tone: Tone, theme: string, amount: number, focusVocabulary: string[], inclusionRate: number, focusGrammar: string[], grammarInclusionRate: number): { prompt: string; schema: Schema } => {
    // Detailed CEFR instructions to guide the model's output
    const cefrInstructions: Record<Difficulty, string> = {
        [Difficulty.A1]: "Target CEFR Level A1 (Breakthrough). Use very basic vocabulary (top 500 words), simple present/past simple tenses, short sentences, and concrete, familiar topics.",
        [Difficulty.A2]: "Target CEFR Level A2 (Waystage). Use high-frequency vocabulary (top 1000 words), basic connectors (and, but, because), simple past/future tenses, and everyday topics.",
        [Difficulty.B1]: "Target CEFR Level B1 (Threshold). Use standard language, mixed tenses (present perfect, continuous), some phrasal verbs, and ability to discuss travel, work, and interests.",
        [Difficulty.B2]: "Target CEFR Level B2 (Vantage). Use a broad vocabulary, complex sentence structures, relative clauses, modals for speculation, and abstract topics.",
        [Difficulty.C1]: "Target CEFR Level C1 (Effective Operational Proficiency). Use low-frequency vocabulary, idiomatic expressions, nuanced grammar (inversion, conditionals), and complex, structured texts.",
        [Difficulty.C2]: "Target CEFR Level C2 (Mastery). Use precise, sophisticated vocabulary, colloquialisms, and handle complex academic or professional topics with ease.",
        [Difficulty.Suffering]: "Target CEFR Level C2+ (Native/Polymath). Use archaic, rare, or highly specific academic vocabulary. Employ extremely complex, nested sentence structures, subtle cultural references, and uncompromising difficulty. Show no mercy."
    };

    let basePrompt = `You are an expert ESL curriculum creator and CEFR examiner. Generate English exercises for an ESL learner's self-study.

**CRITICAL INSTRUCTION: STRICT AMERICAN ENGLISH ONLY**
1. **Spelling**: Use 'color', 'center', 'organize', 'defense', 'program', 'traveling'. DO NOT use 'colour', 'centre', 'organise', 'defence', 'programme', 'travelling'.
2. **Vocabulary**: Use 'apartment', 'roommate', 'vacation', 'truck', 'soccer', 'elevator', 'cookie', 'math', 'pants', 'sidewalk'. DO NOT use 'flat', 'flatmate', 'holiday', 'lorry', 'football', 'lift', 'biscuit', 'maths', 'trousers', 'pavement'.
3. **Grammar**: Prefer 'I just ate' over 'I have just eaten' where appropriate for US usage.
4. **Context**: Avoid British cultural references (e.g., 'GCSEs', 'NHS', 'High Street'). Use US equivalents (e.g., 'GPA', 'Main Street').

Difficulty Level: ${difficulty}
Strict Proficiency Guideline: ${cefrInstructions[difficulty]}
Tone: ${tone}
Theme: ${theme || 'general topics'}
Exercise Type: ${exerciseType}
Use '[BLANK]' as the placeholder for any missing words. Ensure the word bank is shuffled.`;

    // Add specific vocabulary focus instructions if provided
    if (focusVocabulary && focusVocabulary.length > 0) {
        basePrompt += `\n\n**Vocabulary Focus Instructions:**
- Target Vocabulary: [${focusVocabulary.join(', ')}]
- Inclusion Rate: Approximately ${inclusionRate}% of the exercise content should incorporate words from the Target Vocabulary list.
- For the remaining content, please use vocabulary that is thematically or semantically related to the target words or the overall theme.`;
    }

    // Add specific grammar focus instructions if provided
    if (focusGrammar && focusGrammar.length > 0) {
        basePrompt += `\n\n**Grammar Focus Instructions:**
- Target Grammar Structures: [${focusGrammar.join(', ')}]
- Inclusion Rate: Approximately ${grammarInclusionRate}% of the exercise content should incorporate the target grammar structures.`;
    }

    switch (exerciseType) {
        case ExerciseType.FITB:
            return {
                prompt: `${basePrompt.replace('English exercises', `a list of ${amount} fill-in-the-blank sentences.`)}\nProvide 'question' (with [BLANK]), 'answer' (the correct word), and a 'wordBank' of 4 options (including the answer) for each.`,
                schema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            wordBank: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }, required: ["question", "answer", "wordBank"],
                    }
                },
            };
        case ExerciseType.Matching:
            return {
                prompt: `${basePrompt.replace('English exercises', `a list of ${amount} matching sets.`)}\nFor each set, provide 3 'prompts' and 3 corresponding 'answers'. The user must match them.`,
                schema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            prompts: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answers: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }, required: ["prompts", "answers"],
                    }
                },
            };
        case ExerciseType.MultipleChoice:
            return {
                prompt: `${basePrompt.replace('English exercises', `a list of ${amount} multiple-choice questions.`)}\nProvide 'question', 'options' (4 choices), and 'correctAnswer'.`,
                schema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING },
                        }, required: ["question", "options", "correctAnswer"],
                    }
                },
            };
        case ExerciseType.RegisterSort:
             return {
                prompt: `${basePrompt.replace('English exercises', 'a single register sort exercise.')}\nProvide a 'title', an array of 'categories' (e.g., "Formal", "Informal", "Neutral"), an array of 6-8 'phrases' to be sorted, and a 'solution' array mapping each phrase to its correct category.`,
                schema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            title: { type: Type.STRING },
                            categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                            phrases: { type: Type.ARRAY, items: { type: Type.STRING } },
                            solution: {
                                type: Type.ARRAY, items: {
                                    type: Type.OBJECT, properties: {
                                        phrase: { type: Type.STRING },
                                        category: { type: Type.STRING },
                                    }, required: ["phrase", "category"]
                                }
                            }
                        }, required: ["title", "categories", "phrases", "solution"],
                    }
                },
            };
        case ExerciseType.PolitenessScenarios:
            return {
                prompt: `${basePrompt.replace('English exercises', 'a single politeness scenario as a multiple-choice question.')}\nProvide a 'scenario' describing a social situation, a 'question' asking for the most appropriate utterance, an array of 3 'options' with varying levels of politeness, and the 'correctAnswer'.`,
                schema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            scenario: { type: Type.STRING, description: "The social context." },
                            question: { type: Type.STRING, description: "The question asking for the best response." },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING },
                        }, required: ["scenario", "question", "options", "correctAnswer"],
                    }
                },
            };
        case ExerciseType.InferringMeaning:
            return {
                prompt: `${basePrompt.replace('English exercises', 'a single exercise for inferring meaning.')}\nProvide a short 'dialogue' where one speaker implies something without saying it directly. Then provide a 'question' asking what the speaker means, an array of 3 'options', and the 'correctAnswer' which is the correct inference.`,
                schema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            dialogue: { type: Type.STRING, description: "A short dialogue with an implied meaning." },
                            question: { type: Type.STRING, description: "A question asking for the implied meaning." },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING },
                        }, required: ["dialogue", "question", "options", "correctAnswer"],
                    }
                },
            };
        default:
            throw new Error("Unsupported exercise type");
    }
};

/**
 * Generates exercises using the Gemini API.
 */
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
): Promise<any> => {
    if (process.env.API_KEY === undefined) {
        console.warn("Using DUMMY data for verification as API Key is missing.");
        // Dummy data map for verification
        if (exerciseType === ExerciseType.FITB) {
            return Array.from({ length: amount }).map((_, i) => ({
                question: `This is a [BLANK] sentence #${i + 1}.`,
                answer: "dummy",
                wordBank: ["dummy", "fake", "wrong", "test"]
            }));
        }
        if (exerciseType === ExerciseType.Matching) {
            return Array.from({ length: amount }).map((_, i) => ({
                prompts: [`Prompt A #${i + 1}`, `Prompt B #${i + 1}`, `Prompt C #${i + 1}`],
                answers: [`Answer A #${i + 1}`, `Answer B #${i + 1}`, `Answer C #${i + 1}`]
            }));
        }
        if (exerciseType === ExerciseType.MultipleChoice) {
            return Array.from({ length: amount }).map((_, i) => ({
                question: `What is the correct answer for question #${i + 1}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: "Option A"
            }));
        }
        // Add dummy data for PicturePrompt with simulated delay
        if (exerciseType === ExerciseType.PicturePrompt) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return Array.from({ length: amount }).map((_, i) => ({
                title: `Dummy Picture Prompt #${i + 1}`,
                imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                prompt: `Dummy prompt for ${theme} variation ${i + 1}`
            }));
        }
        // Add more dummy data types if needed, otherwise fallback to error
        return { error: "Dummy data not implemented for this type." };
    }

    try {
        // Handle image generation separately for PicturePrompt exercise
        if (exerciseType === ExerciseType.PicturePrompt) {
            const imageGenerationPromises = Array.from({ length: amount }).map(async (_, i) => {
                const imagePrompt = `A compelling and slightly ambiguous scene about "${theme}". The style should be ${tone}. The image is for an ESL student at a ${difficulty} level to analyze. ${i > 0 ? `Variation ${i + 1}.` : ''}`;

                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image', // nano banana model for image generation
                        contents: {
                            parts: [{ text: imagePrompt }],
                        },
                        config: {
                            responseModalities: [Modality.IMAGE],
                        },
                    });

                    const part = response.candidates?.[0]?.content?.parts?.[0];
                    if (part?.inlineData) {
                        const base64ImageBytes = part.inlineData.data;
                        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        return {
                            title: `Picture Prompt #${i + 1}`,
                            imageUrl: imageUrl,
                            prompt: imagePrompt
                        };
                    }
                } catch (error) {
                    console.error(`Error generating image variation ${i + 1}:`, error);
                    return null;
                }
                return null;
            });

            const results = await Promise.all(imageGenerationPromises);
            const generatedExercises = results.filter((ex): ex is any => ex !== null);

            if (generatedExercises.length === 0) {
                return { error: "Failed to generate any images for the picture prompt." };
            }
            return generatedExercises;
        }

        // Get prompt and schema for text-based exercises
        const { prompt, schema } = getPromptAndSchema(exerciseType, difficulty, tone, theme, amount, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate);

        // Call Gemini API for content generation
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text!.trim();
        const parsed = JSON.parse(jsonText);

        // Ensure the output is always an array, even for single-item generations.
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
        console.error("Error generating exercises:", error);
        if (error instanceof Error && error.message.includes('API_KEY')) {
            return { error: "API Key is not valid. Please check your environment configuration." };
        }
        return { error: "Failed to generate exercises. The model may be overloaded or the request is invalid. Please try again later." };
    }
};

/**
 * Checks a user's answer for an exercise using the Gemini Flash Lite model for speed.
 * Returns a JSON string with feedback and correctness.
 */
export const checkAnswerWithAI = async (
    exerciseType: string,
    exerciseContext: any,
    userResponse: any
): Promise<string> => {
    if (process.env.API_KEY === undefined) {
        return JSON.stringify({
            isCorrect: true,
            feedback: "This is dummy feedback because the API Key is missing. Great job!"
        });
    }

    const prompt = `
    You are an expert ESL teacher's assistant.
    Task: Evaluate the student's answer for the following exercise.

    Exercise Type: ${exerciseType}
    Context (Exercise Data): ${JSON.stringify(exerciseContext)}
    Student Response: ${JSON.stringify(userResponse)}

    Return a JSON object with this structure:
    {
        "isCorrect": boolean, // true if the answer is factually and contextually correct
        "feedback": string // concise feedback (under 100 words) with emoji rating
    }
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite-preview-02-05',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        return response.text!;
    } catch (error) {
        console.error("Error checking answer:", error);
        return JSON.stringify({
            isCorrect: false,
            feedback: "Could not retrieve feedback at this time."
        });
    }
};
