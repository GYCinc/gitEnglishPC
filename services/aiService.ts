import * as mistral from './mistralService';
import * as gemini from './geminiService';
import { ExerciseType, Difficulty, Tone } from '../enums';

/**
 * Unified AI Service that delegates to the available provider.
 * Priority: Mistral > Gemini > Dummy (handled by providers).
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
) => {
  if (process.env.MISTRAL_API_KEY) {
    console.log("Using Mistral AI for exercise generation.");
    return mistral.generateExercises(
      exerciseType,
      difficulty,
      tone,
      theme,
      amount,
      focusVocabulary,
      inclusionRate,
      focusGrammar,
      grammarInclusionRate
    );
  }

  console.log("Using Gemini AI (or Dummy) for exercise generation.");
  return gemini.generateExercises(
    exerciseType,
    difficulty,
    tone,
    theme,
    amount,
    focusVocabulary,
    inclusionRate,
    focusGrammar,
    grammarInclusionRate
  );
};

export const checkAnswerWithAI = async (
  exerciseType: string,
  exerciseContext: any,
  userResponse: any
) => {
  if (process.env.MISTRAL_API_KEY) {
    return mistral.checkAnswerWithAI(exerciseType, exerciseContext, userResponse);
  }
  return gemini.checkAnswerWithAI(exerciseType, exerciseContext, userResponse);
};
