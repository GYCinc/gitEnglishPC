
import { ExerciseType, Difficulty, Tone } from './types';

export const DIFFICULTY_LEVELS = Object.values(Difficulty);
export const TONES = Object.values(Tone);

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.A1]: 'A1 (Beginner)',
  [Difficulty.A2]: 'A2 (Elementary)',
  [Difficulty.B1]: 'B1 (Intermediate)',
  [Difficulty.B2]: 'B2 (Upper Int.)',
  [Difficulty.C1]: 'C1 (Advanced)',
  [Difficulty.C2]: 'C2 (Mastery)',
  [Difficulty.Suffering]: 'Suffering (C2+)',
};

export const DEFAULT_BLOCK_DIMENSIONS = { width: 800, height: 600 };

export const EXERCISE_SIZE_OVERRIDES: Partial<Record<ExerciseType, { width: number; height: number }>> = {
    [ExerciseType.FITB]: { width: 700, height: 600 },
    [ExerciseType.MultipleChoice]: { width: 700, height: 800 },
    [ExerciseType.SentenceScramble]: { width: 700, height: 700 },
    [ExerciseType.Matching]: { width: 700, height: 600 },
    [ExerciseType.ClozeParagraph]: { width: 800, height: 700 },
    [ExerciseType.DialogueCompletion]: { width: 800, height: 600 },
    [ExerciseType.ErrorCorrection]: { width: 700, height: 600 },
    [ExerciseType.StorySequencing]: { width: 700, height: 700 },
    [ExerciseType.Prediction]: { width: 700, height: 700 },
    [ExerciseType.RuleDiscovery]: { width: 800, height: 700 },
    [ExerciseType.SpotTheDifference]: { width: 800, height: 700 },
    [ExerciseType.PicturePrompt]: { width: 600, height: 750 },
    [ExerciseType.MoralDilemma]: { width: 700, height: 600 },
    [ExerciseType.ReadingGist]: { width: 800, height: 700 },
    [ExerciseType.ReadingDetail]: { width: 800, height: 800 },
    [ExerciseType.FunctionalWriting]: { width: 700, height: 600 },
    [ExerciseType.DictoGloss]: { width: 700, height: 600 },
    [ExerciseType.CollocationGapFill]: { width: 700, height: 600 },
    [ExerciseType.WordFormation]: { width: 700, height: 600 },
    [ExerciseType.PhrasalVerbGapFill]: { width: 700, height: 600 },
    [ExerciseType.CollocationOddOneOut]: { width: 700, height: 600 },
    [ExerciseType.InformationTransfer]: { width: 800, height: 700 },
    [ExerciseType.ListeningSpecificInfo]: { width: 700, height: 700 },
    [ExerciseType.ProblemSolvingScenario]: { width: 700, height: 600 },
    [ExerciseType.RolePlayScenario]: { width: 700, height: 600 },
    [ExerciseType.StorytellingFromPrompts]: { width: 700, height: 600 },
    [ExerciseType.JustifyYourOpinion]: { width: 700, height: 600 },
    [ExerciseType.PictureComparison]: { width: 800, height: 700 },
    [ExerciseType.FunctionMatching]: { width: 700, height: 600 },
    [ExerciseType.RegisterSort]: { width: 800, height: 700 },
    [ExerciseType.PolitenessScenarios]: { width: 700, height: 700 },
    [ExerciseType.InferringMeaning]: { width: 700, height: 700 },
};

export const EXERCISE_PEDAGOGY: Record<ExerciseType, string> = {
  [ExerciseType.FITB]: 'PPP',
  [ExerciseType.MultipleChoice]: 'PPP',
  [ExerciseType.SentenceScramble]: 'PPP',
  [ExerciseType.Matching]: 'PPP',
  [ExerciseType.CollocationGapFill]: 'Lexis',
  [ExerciseType.WordFormation]: 'Lexis',
  [ExerciseType.PhrasalVerbGapFill]: 'Lexis',
  [ExerciseType.CollocationOddOneOut]: 'Lexis',
  [ExerciseType.ErrorCorrection]: 'C-R',
  [ExerciseType.RuleDiscovery]: 'C-R',
  [ExerciseType.SpotTheDifference]: 'C-R',
  [ExerciseType.DictoGloss]: 'C-R',
  [ExerciseType.ClozeParagraph]: 'Input',
  [ExerciseType.DialogueCompletion]: 'Input',
  [ExerciseType.Prediction]: 'Input',
  [ExerciseType.InformationTransfer]: 'Input',
  [ExerciseType.ReadingGist]: 'Skills',
  [ExerciseType.ReadingDetail]: 'Skills',
  [ExerciseType.FunctionalWriting]: 'Skills',
  [ExerciseType.ListeningSpecificInfo]: 'Skills',
  [ExerciseType.StorySequencing]: 'TBLT',
  [ExerciseType.PicturePrompt]: 'TBLT',
  [ExerciseType.MoralDilemma]: 'TBLT',
  [ExerciseType.ProblemSolvingScenario]: 'TBLT',
  [ExerciseType.RolePlayScenario]: 'Production',
  [ExerciseType.StorytellingFromPrompts]: 'Production',
  [ExerciseType.JustifyYourOpinion]: 'Production',
  [ExerciseType.PictureComparison]: 'Production',
  [ExerciseType.FunctionMatching]: 'Social English',
  [ExerciseType.RegisterSort]: 'Social English',
  [ExerciseType.PolitenessScenarios]: 'Social English',
  [ExerciseType.InferringMeaning]: 'Social English',
};

const CATEGORY_DEFINITIONS = {
    PPP: {
        name: 'PPP',
        description: "Presentation, Practice, Production: A structured approach focusing on accuracy.",
        types: [ExerciseType.FITB, ExerciseType.SentenceScramble, ExerciseType.Matching, ExerciseType.MultipleChoice],
    },
    Input: {
        name: 'Input',
        description: "Input-Based Tasks: Focus on understanding and processing language.",
        types: [ExerciseType.DialogueCompletion, ExerciseType.ClozeParagraph, ExerciseType.Prediction, ExerciseType.InformationTransfer],
    },
    Lexis: {
        name: 'Lexis',
        description: "Lexical Approach: Focuses on vocabulary and chunks of language.",
        types: [ExerciseType.CollocationGapFill, ExerciseType.WordFormation, ExerciseType.PhrasalVerbGapFill, ExerciseType.CollocationOddOneOut],
    },
    Skills: {
        name: 'Skills',
        description: "Language Skills: Exercises for reading, writing, and functional communication.",
        types: [ExerciseType.ReadingGist, ExerciseType.FunctionalWriting, ExerciseType.ListeningSpecificInfo, ExerciseType.ReadingDetail],
    },
    TBLT: {
        name: 'TBLT',
        description: "Task-Based Language Teaching: Focuses on completing a task using language.",
        types: [ExerciseType.PicturePrompt, ExerciseType.StorySequencing, ExerciseType.MoralDilemma, ExerciseType.ProblemSolvingScenario],
    },
    SocialEnglish: {
        name: 'Social English',
        description: "Using language appropriately in social contexts (Pragmatics).",
        types: [ExerciseType.FunctionMatching, ExerciseType.RegisterSort, ExerciseType.PolitenessScenarios, ExerciseType.InferringMeaning],
    },
    CR: {
        name: 'C-R',
        description: "Consciousness-Raising: Activities that draw attention to grammatical rules.",
        types: [ExerciseType.ErrorCorrection, ExerciseType.DictoGloss, ExerciseType.RuleDiscovery, ExerciseType.SpotTheDifference],
    },
    Production: {
        name: 'Production',
        description: "Production (Creative Output): Tasks that push learners to produce language.",
        types: [ExerciseType.RolePlayScenario, ExerciseType.PictureComparison, ExerciseType.StorytellingFromPrompts, ExerciseType.JustifyYourOpinion],
    },
};

export const EXERCISE_CATEGORIES = [
    CATEGORY_DEFINITIONS.PPP,
    CATEGORY_DEFINITIONS.Lexis,
    CATEGORY_DEFINITIONS.CR,
    CATEGORY_DEFINITIONS.Input,
    CATEGORY_DEFINITIONS.Skills,
    CATEGORY_DEFINITIONS.SocialEnglish,
    CATEGORY_DEFINITIONS.TBLT,
    CATEGORY_DEFINITIONS.Production,
];

type ColorScheme = {
  textOnDark: string;
  textOnLight: string;
  border: string;
  shadow: string;
  chip: { bg: string; text: string; border: string; };
  bgOnDark: string;
};

export const PEDAGOGY_COLORS: Record<string, ColorScheme> = {
  'PPP': {
    textOnDark: 'text-cyan-300',
    textOnLight: 'text-slate-700',
    border: 'border-cyan-400',
    shadow: 'shadow-cyan-500/30',
    chip: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-300' },
    bgOnDark: 'bg-cyan-900/40'
  },
  'Input': {
    textOnDark: 'text-emerald-300',
    textOnLight: 'text-slate-700',
    border: 'border-emerald-400',
    shadow: 'shadow-emerald-500/30',
    chip: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    bgOnDark: 'bg-emerald-900/40'
  },
  'Lexis': {
    textOnDark: 'text-fuchsia-300',
    textOnLight: 'text-slate-700',
    border: 'border-fuchsia-400',
    shadow: 'shadow-fuchsia-500/30',
    chip: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-800', border: 'border-fuchsia-300' },
    bgOnDark: 'bg-fuchsia-900/40'
  },
  'Skills': {
    textOnDark: 'text-amber-300',
    textOnLight: 'text-slate-700',
    border: 'border-amber-400',
    shadow: 'shadow-amber-500/30',
    chip: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    bgOnDark: 'bg-amber-900/40'
  },
  'TBLT': {
    textOnDark: 'text-indigo-300',
    textOnLight: 'text-slate-700',
    border: 'border-indigo-400',
    shadow: 'shadow-indigo-500/30',
    chip: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' },
    bgOnDark: 'bg-indigo-900/40'
  },
  'Social English': {
    textOnDark: 'text-rose-300',
    textOnLight: 'text-slate-700',
    border: 'border-rose-400',
    shadow: 'shadow-rose-500/30',
    chip: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
    bgOnDark: 'bg-rose-900/40'
  },
  'C-R': {
    textOnDark: 'text-lime-300',
    textOnLight: 'text-slate-700',
    border: 'border-lime-400',
    shadow: 'shadow-lime-500/30',
    chip: { bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-300' },
    bgOnDark: 'bg-lime-900/40'
  },
  'Production': {
    textOnDark: 'text-violet-300',
    textOnLight: 'text-slate-700',
    border: 'border-violet-400',
    shadow: 'shadow-violet-500/30',
    chip: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-300' },
    bgOnDark: 'bg-violet-900/40'
  },
  'Default': {
    textOnDark: 'text-slate-300',
    textOnLight: 'text-slate-700',
    border: 'border-slate-400',
    shadow: 'shadow-slate-500/30',
    chip: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-300' },
    bgOnDark: 'bg-slate-900/40'
  }
};

export const TEMPLATE_HEIGHTS: Partial<Record<ExerciseType, number>> = {
    [ExerciseType.SentenceScramble]: 230,
    [ExerciseType.Matching]: 100,
    [ExerciseType.FunctionMatching]: 100,
    [ExerciseType.StorySequencing]: 120,
    [ExerciseType.FITB]: 120,
    [ExerciseType.CollocationGapFill]: 120,
    [ExerciseType.PhrasalVerbGapFill]: 120,
    [ExerciseType.MultipleChoice]: 150,
    [ExerciseType.Prediction]: 150,
    [ExerciseType.RuleDiscovery]: 180,
    [ExerciseType.SpotTheDifference]: 180,
    [ExerciseType.PolitenessScenarios]: 150,
    [ExerciseType.InferringMeaning]: 180,
    [ExerciseType.CollocationOddOneOut]: 120,
    [ExerciseType.ClozeParagraph]: 140,
    [ExerciseType.DialogueCompletion]: 140,
    [ExerciseType.WordFormation]: 160,
    [ExerciseType.ErrorCorrection]: 150,
};
export const DEFAULT_TEMPLATE_HEIGHT = 150;

export const ESTIMATED_TIME: Record<ExerciseType, { base: number; perItem: number }> = {
    [ExerciseType.FITB]: { base: 1, perItem: 1 },
    [ExerciseType.MultipleChoice]: { base: 1, perItem: 1 },
    [ExerciseType.SentenceScramble]: { base: 2, perItem: 2 },
    [ExerciseType.ClozeParagraph]: { base: 2, perItem: 3 },
    [ExerciseType.Matching]: { base: 1, perItem: 1 },
    [ExerciseType.ErrorCorrection]: { base: 2, perItem: 2 },
    [ExerciseType.DialogueCompletion]: { base: 2, perItem: 2 },
    [ExerciseType.StorySequencing]: { base: 3, perItem: 2 },
    [ExerciseType.Prediction]: { base: 2, perItem: 2 },
    [ExerciseType.RuleDiscovery]: { base: 5, perItem: 3 },
    [ExerciseType.SpotTheDifference]: { base: 3, perItem: 3 },
    [ExerciseType.DictoGloss]: { base: 10, perItem: 0 },
    [ExerciseType.PicturePrompt]: { base: 5, perItem: 0 },
    [ExerciseType.MoralDilemma]: { base: 10, perItem: 0 },
    [ExerciseType.ProblemSolvingScenario]: { base: 10, perItem: 0 },
    [ExerciseType.CollocationGapFill]: { base: 1, perItem: 1 },
    [ExerciseType.WordFormation]: { base: 1, perItem: 1.5 },
    [ExerciseType.PhrasalVerbGapFill]: { base: 1, perItem: 1.5 },
    [ExerciseType.CollocationOddOneOut]: { base: 1, perItem: 1 },
    [ExerciseType.InformationTransfer]: { base: 10, perItem: 0 },
    [ExerciseType.ReadingGist]: { base: 5, perItem: 0 },
    [ExerciseType.ReadingDetail]: { base: 10, perItem: 0 },
    [ExerciseType.ListeningSpecificInfo]: { base: 8, perItem: 0 },
    [ExerciseType.FunctionalWriting]: { base: 15, perItem: 0 },
    [ExerciseType.RolePlayScenario]: { base: 10, perItem: 0 },
    [ExerciseType.StorytellingFromPrompts]: { base: 15, perItem: 0 },
    [ExerciseType.JustifyYourOpinion]: { base: 10, perItem: 0 },
    [ExerciseType.PictureComparison]: { base: 10, perItem: 0 },
    [ExerciseType.FunctionMatching]: { base: 1, perItem: 1 },
    [ExerciseType.RegisterSort]: { base: 5, perItem: 0 },
    [ExerciseType.PolitenessScenarios]: { base: 2, perItem: 2 },
    [ExerciseType.InferringMeaning]: { base: 3, perItem: 2 },
};

export const SINGLE_INSTANCE_TYPES = [
    ExerciseType.ReadingGist, ExerciseType.ReadingDetail, ExerciseType.FunctionalWriting,
    ExerciseType.DictoGloss, ExerciseType.InformationTransfer, ExerciseType.ListeningSpecificInfo,
    ExerciseType.ProblemSolvingScenario, ExerciseType.RolePlayScenario, ExerciseType.StorytellingFromPrompts,
    ExerciseType.JustifyYourOpinion, ExerciseType.RegisterSort, ExerciseType.PictureComparison,
    ExerciseType.MoralDilemma, ExerciseType.PicturePrompt
];

export const calculateExerciseAmount = (exerciseType: ExerciseType, height: number): number => {
    if (SINGLE_INSTANCE_TYPES.includes(exerciseType)) return 1;
    const headerAndPaddingHeight = 70; 
    const availableHeight = height - headerAndPaddingHeight;
    const templateHeight = TEMPLATE_HEIGHTS[exerciseType] || DEFAULT_TEMPLATE_HEIGHT;
    if (templateHeight <= 0) return 1;
    return Math.max(1, Math.floor(availableHeight / templateHeight));
};

export const calculateExerciseDuration = (exerciseType: ExerciseType, height: number, manualAmount?: number): number => {
    const amount = manualAmount ?? calculateExerciseAmount(exerciseType, height);
    const timing = ESTIMATED_TIME[exerciseType] || { base: 5, perItem: 1 };
    return Math.ceil(timing.base + (timing.perItem * (amount - 1)));
};
