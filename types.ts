import type { FC } from 'react';

export enum ExerciseType {
  FITB = 'Fill-in-the-Blank',
  MultipleChoice = 'Multiple Choice',
  SentenceScramble = 'Sentence Scramble',
  ClozeParagraph = 'Cloze Paragraph',
  Matching = 'Matching',
  ErrorCorrection = 'Error Correction',
  DialogueCompletion = 'Dialogue Completion',
  StorySequencing = 'Story Sequencing',
  Prediction = 'Prediction (What Happens Next?)',
  RuleDiscovery = 'Rule Discovery (C-R)',
  SpotTheDifference = 'Spot the Difference (C-R)',
  DictoGloss = 'Dicto-Gloss (C-R)',
  PicturePrompt = 'Picture Prompt',
  MoralDilemma = 'Moral Dilemma (TBLT)',
  ProblemSolvingScenario = 'Problem-Solving Scenario',
  CollocationGapFill = 'Collocation Gap-Fill',
  WordFormation = 'Word Formation',
  PhrasalVerbGapFill = 'Phrasal Verb Gap-Fill',
  CollocationOddOneOut = 'Collocation Odd One Out',
  InformationTransfer = 'Information Transfer',
  ReadingGist = 'Reading for Gist (Skimming)',
  ReadingDetail = 'Reading for Detail (Scanning)',
  ListeningSpecificInfo = 'Listening for Specific Info',
  FunctionalWriting = 'Functional Writing Prompt',
  // Communicative Production Types
  RolePlayScenario = 'Role-Play Scenario',
  StorytellingFromPrompts = 'Storytelling from Prompts',
  JustifyYourOpinion = 'Justify Your Opinion',
  PictureComparison = 'Picture Comparison',
  // Pragmatics Types
  FunctionMatching = 'Function Matching',
  RegisterSort = 'Register Sort',
  PolitenessScenarios = 'Politeness Scenarios',
  InferringMeaning = 'Inferring Meaning',
}

export enum Difficulty {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  Suffering = 'Suffering',
}

export enum Tone {
  Casual = 'Casual',
  Formal = 'Formal',
  Academic = 'Academic',
}

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
