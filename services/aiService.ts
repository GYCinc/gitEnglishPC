import * as mistral from './mistralService';
import * as deepseek from './deepSeekService';
import { ExerciseType, Difficulty, Tone } from '../enums';

/**
 * Unified AI Service.
 * Routing Logic:
 * - Fast tasks (checkAnswer) -> Mistral
 * - Long tasks (generateExercises) -> DeepSeek
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
  console.log("Routing generation task to DeepSeek.");
  return deepseek.generateExercises(
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
  console.log("Routing checkAnswer task to Mistral.");
  return mistral.checkAnswerWithAI(exerciseType, exerciseContext, userResponse);
};
