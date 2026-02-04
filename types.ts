import type { FC } from 'react';
import { ExerciseType, Difficulty, Tone } from './enums';

// Re-export the enums to maintain the same interface
export { ExerciseType, Difficulty, Tone };

export interface ExerciseBlockState {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  exerciseType: ExerciseType;
  difficulty: Difficulty;
  tone: Tone;
  theme: string;
  focusVocabulary: string[];
  inclusionRate: number;
  focusGrammar: string[];
  grammarInclusionRate: number;
  isGenerated: boolean;
  quantity?: number;
  // This helps track the current interaction/activity for logging purposes
  // E.g., for a FITB exercise with 5 items, this could be the ID of the current item
  currentFocusItemId?: string; 
}

// Interfaces for exercises (kept as is for brevity, logic relies on these existing)
export interface IFITBExercise {
  question: string; answer: string; wordBank: string[];
}
export interface ICollocationExercise extends IFITBExercise { collocation: string; }
export interface IPhrasalVerbGapFillExercise extends IFITBExercise { phrasalVerb: string; }
export interface IWordFormationExercise { question: string; rootWord: string; answer: string; }
export interface IMultipleChoiceExercise { question: string; options: string[]; correctAnswer: string; }
export interface ISentenceScrambleExercise { scrambledWords: string[]; correct: string; }
export interface IClozeParagraphExercise { paragraph: string; answers: string[]; wordBank: string[]; }
export interface IMatchingExercise { prompts: string[]; answers: string[]; }
export interface IErrorCorrectionExercise { incorrectSentence: string; correctSentence: string; }
export interface IDialogueCompletionExercise { dialogue: string; answers: string[]; wordBank: string[]; }
export interface IStorySequencingExercise { title: string; storyParts: string[]; }
export interface IPredictionExercise { storyStart: string; options: string[]; correctAnswer: string; }
export interface IRuleDiscoveryExercise { sentences: string[]; question: string; options: string[]; correctAnswer: string; }
export interface ISpotTheDifferenceExercise { sentenceA: string; sentenceB: string; question: string; options: string[]; correctAnswer: string; }
export interface IPicturePromptExercise { title: string; imageUrl: string; prompt: string; }
export interface IMoralDilemmaExercise { title: string; dilemma: string; }
export interface IReadingGistExercise { title: string; text: string; question: string; options: string[]; correctAnswer: string; }
export interface IReadingDetailExercise { title: string; text: string; questions: { question: string; answer: string; }[]; }
export interface IFunctionalWritingExercise { title: string; scenario: string; task: string; }
export interface IDictoGlossExercise { title: string; text: string; }
export interface ICollocationOddOneOutExercise { keyword: string; options: string[]; correctAnswer: string; }
export interface IInformationTransferExercise { title: string; text: string; formFields: string[]; }
export interface IListeningSpecificInfoExercise { title: string; audioText: string; questions: { question: string; answer: string; }[]; }
export interface IProblemSolvingScenarioExercise { title: string; scenario: string; }
export interface IRolePlayScenarioExercise { title: string; character: string; situation: string; task: string; }
export interface IStorytellingFromPromptsExercise { title: string; prompts: string[]; task: string; }
export interface IJustifyYourOpinionExercise { title: string; statement: string; task: string; }
export interface IPictureComparisonExercise { title: string; promptA: string; promptB: string; task: string; }
export interface IFunctionMatchingExercise extends IMatchingExercise {}
export interface IRegisterSortExercise { title: string; categories: string[]; phrases: string[]; solution: { phrase: string; category: string }[]; }
export interface IPolitenessScenariosExercise { scenario: string; question: string; options: string[]; correctAnswer: string; }
export interface IInferringMeaningExercise { dialogue: string; question: string; options: string[]; correctAnswer: string; }

export interface ExerciseCategory {
  name: string;
  icon: FC<{className?: string}>;
  types: ExerciseType[];
}
