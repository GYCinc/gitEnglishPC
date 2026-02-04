// Define the enums separately to ensure proper build system compatibility

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