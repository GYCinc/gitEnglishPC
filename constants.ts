import { ExerciseType, Difficulty, Tone } from './types';

export const DIFFICULTY_LEVELS = Object.values(Difficulty);
export const TONES = Object.values(Tone);

export const VALID_STUDENT_IDS = [
  'aarontutor',
  'andrea-always-aims-above-average-2026',
  'carlos-premium-english-2025',
  'david-saves-snacks-2025',
  'edwin-enjoys-every-english-exam-2026',
  'francisco-finds-five-funny-facts-2026',
  'jocelyn-explains-meeting-mania-2026',
  'kyrylo-keeps-kicking-knowledge-keys-2026',
  'leidy-2025-wallyworld',
  'maarten-makes-many-major-moves-2026',
  'matias-masters-many-magic-maps-2026',
  'nicolas-never-needs-new-notes-2026',
  'norbert-never-naps-near-noon-2026',
  'ruslan-rarely-runs-round-rooms-2026',
  'sergio-sees-seven-super-stars-2026',
  'test'
];

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

// PROFESSIONAL BUSINESS Palette - adapted for WCAG AA on #fffbf0 (warm paper) background
export const PEDAGOGY_COLORS: Record<string, ColorScheme> = {
  'PPP': {
    textOnDark: 'text-primary-blue-300', // Confident blue on dark
    textOnLight: 'text-primary-blue-800', // Darker blue on paper for contrast
    border: 'border-primary-blue-400',
    shadow: 'shadow-primary-blue-500/30',
    chip: { bg: 'bg-primary-blue-50', text: 'text-primary-blue-900', border: 'border-primary-blue-300' },
    bgOnDark: 'bg-primary-blue-900/40'
  },
  'Input': {
    textOnDark: 'text-secondary-purple-300', // Creative purple on dark
    textOnLight: 'text-secondary-purple-800', // Darker purple on paper for contrast
    border: 'border-secondary-purple-400',
    shadow: 'shadow-secondary-purple-500/30',
    chip: { bg: 'bg-secondary-purple-50', text: 'text-secondary-purple-900', border: 'border-secondary-purple-300' },
    bgOnDark: 'bg-secondary-purple-900/40'
  },
  'Lexis': {
    textOnDark: 'text-accent-green-300', // Growth green on dark
    textOnLight: 'text-accent-green-800', // Darker green on paper for contrast
    border: 'border-accent-green-400',
    shadow: 'shadow-accent-green-500/30',
    chip: { bg: 'bg-accent-green-50', text: 'text-accent-green-900', border: 'border-accent-green-300' },
    bgOnDark: 'bg-accent-green-900/40'
  },
  'Skills': {
    textOnDark: 'text-neutral-gray-300', // Professional gray on dark
    textOnLight: 'text-neutral-gray-800', // Darker gray on paper for contrast
    border: 'border-neutral-gray-400',
    shadow: 'shadow-neutral-gray-500/30',
    chip: { bg: 'bg-neutral-gray-50', text: 'text-neutral-gray-900', border: 'border-neutral-gray-300' },
    bgOnDark: 'bg-neutral-gray-900/40'
  },
  'TBLT': {
    textOnDark: 'text-warm-orange-300', // Warm orange on dark (from Creative palette as Accent)
    textOnLight: 'text-warm-orange-800', // Darker orange on paper
    border: 'border-warm-orange-400',
    shadow: 'shadow-warm-orange-500/30',
    chip: { bg: 'bg-warm-orange-50', text: 'text-warm-orange-900', border: 'border-warm-orange-300' },
    bgOnDark: 'bg-warm-orange-900/40'
  },
  'Social English': {
    textOnDark: 'text-calm-teal-300', // Calm teal on dark (from Trust palette as Primary)
    textOnLight: 'text-calm-teal-800', // Darker teal on paper
    border: 'border-calm-teal-400',
    shadow: 'shadow-calm-teal-500/30',
    chip: { bg: 'bg-calm-teal-50', text: 'text-calm-teal-900', border: 'border-calm-teal-300' },
    bgOnDark: 'bg-calm-teal-900/40'
  },
  'C-R': {
    textOnDark: 'text-fresh-lime-300', // Fresh lime on dark (from Creative palette as Accent)
    textOnLight: 'text-fresh-lime-800', // Darker lime on paper
    border: 'border-fresh-lime-400',
    shadow: 'shadow-fresh-lime-500/30',
    chip: { bg: 'bg-fresh-lime-50', text: 'text-fresh-lime-900', border: 'border-fresh-lime-300' },
    bgOnDark: 'bg-fresh-lime-900/40'
  },
  'Production': {
    textOnDark: 'text-innovation-pink-300', // Innovation pink on dark (from Tech palette)
    textOnLight: 'text-innovation-pink-800', // Darker pink on paper
    border: 'border-innovation-pink-400',
    shadow: 'shadow-innovation-pink-500/30',
    chip: { bg: 'bg-innovation-pink-50', text: 'text-innovation-pink-900', border: 'border-innovation-pink-300' },
    bgOnDark: 'bg-innovation-pink-900/40'
  },
  'Default': { // Fallback, uses slate for professionalism
    textOnDark: 'text-slate-300',
    textOnLight: 'text-slate-900',
    border: 'border-slate-400',
    shadow: 'shadow-slate-500/30',
    chip: { bg: 'bg-slate-50', text: 'text-slate-900', border: 'border-slate-300' },
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
