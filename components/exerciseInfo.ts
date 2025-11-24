
import { ExerciseType, Difficulty } from '../types';

export interface ExerciseInfo {
  name: string;
  description: string;
  pedagogy: string;
  example: string;
  difficultyRating: Difficulty;
}

export const EXERCISE_INFO: Record<ExerciseType, ExerciseInfo> = {
  [ExerciseType.FITB]: {
    name: 'Fill-in-the-Blank',
    description: 'Students complete a sentence by filling in a missing word. It focuses on vocabulary or grammar in a controlled context.',
    pedagogy: 'A classic drill from the Presentation-Practice-Production (PPP) model, emphasizing accuracy. Supported by behaviorist learning theories.',
    example: 'She _______ to the market every morning. (go / goes / went)',
    difficultyRating: Difficulty.A1,
  },
  [ExerciseType.MultipleChoice]: {
    name: 'Multiple Choice',
    description: 'Learners select the correct answer from a set of options to complete a sentence or answer a question.',
    pedagogy: 'Common in PPP for controlled practice and testing. It allows for quick assessment of understanding of specific language points.',
    example: 'What is the capital of France? A) London B) Paris C) Rome',
    difficultyRating: Difficulty.A2,
  },
  [ExerciseType.SentenceScramble]: {
    name: 'Sentence Scramble',
    description: 'Words of a sentence are given in a jumbled order, and students must rearrange them to form a coherent sentence.',
    pedagogy: 'A PPP exercise focusing on syntax and word order. It helps learners internalize grammatical structures through manipulation.',
    example: 'Scrambled: [is, cat, the, sleeping]. Correct: The cat is sleeping.',
    difficultyRating: Difficulty.A1,
  },
  [ExerciseType.ClozeParagraph]: {
    name: 'Cloze Paragraph',
    description: 'A text where words have been removed. Students fill in the gaps, often using a word bank. It tests comprehension and vocabulary.',
    pedagogy: 'An input-based task that integrates reading with vocabulary or grammar. Wilson Taylor\'s research highlights its value in testing comprehension.',
    example: 'He walked into the room and saw a large [BLANK] on the wall. The colors were bright and [BLANK].',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.Matching]: {
    name: 'Matching',
    description: 'Students draw lines between items in two columns or pair them up, such as words and definitions, or questions and answers.',
    pedagogy: 'A versatile PPP activity for reinforcing connections, such as vocabulary and meaning, or grammatical forms and their functions.',
    example: 'Match words to definitions: 1. Apple -> a) A yellow fruit. 2. Banana -> b) A red fruit.',
    difficultyRating: Difficulty.A1,
  },
  [ExerciseType.ErrorCorrection]: {
    name: 'Error Correction',
    description: 'Learners are given sentences containing grammatical errors and must identify and correct them.',
    pedagogy: 'A core Consciousness-Raising (C-R) activity. Stephen Krashen\'s theories suggest that focusing on form helps turn "learned" knowledge into "acquired" competence.',
    example: 'Incorrect: I have went to the cinema. Correct: I have gone...',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.DialogueCompletion]: {
    name: 'Dialogue Completion',
    description: 'Students fill in missing parts of a conversation, helping them understand conversational flow and appropriate responses.',
    pedagogy: 'An input-based activity that bridges grammar practice with communicative context. It provides scaffolding for producing natural-sounding language.',
    example: 'A: Where are you going? B: I\'m going to the [BLANK].',
    difficultyRating: Difficulty.A2,
  },
  [ExerciseType.StorySequencing]: {
    name: 'Story Sequencing',
    description: 'A story is presented in jumbled paragraphs or sentences, and students must put them in the correct logical order.',
    pedagogy: 'A Task-Based Language Teaching (TBLT) activity that focuses on meaning and discourse coherence over sentence-level grammar. It promotes critical thinking skills.',
    example: 'Put the events in order: A) He woke up. B) He ate breakfast. C) His alarm rang.',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.Prediction]: {
    name: 'Prediction',
    description: 'Students read or listen to the beginning of a story and predict what will happen next, often choosing from given options.',
    pedagogy: 'An input-focused task that develops reading/listening sub-skills and schema activation. Encourages engagement and comprehension.',
    example: 'The sky turned dark and the wind began to howl. What happens next? A) The sun came out. B) It started to rain.',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.RuleDiscovery]: {
    name: 'Rule Discovery (C-R)',
    description: 'Learners are shown several examples of a grammatical structure and are guided to figure out the rule themselves.',
    pedagogy: 'An inductive, Consciousness-Raising approach advocated by linguists like Rod Ellis. It promotes deeper processing and better retention of grammar rules.',
    example: 'Examples: I play tennis. She plays tennis. They play tennis. Rule: Add -s to verbs for...?',
    difficultyRating: Difficulty.C1,
  },
  [ExerciseType.SpotTheDifference]: {
    name: 'Spot the Difference (C-R)',
    description: 'Students compare two similar sentences or texts and identify the subtle differences in form and meaning.',
    pedagogy: 'A Consciousness-Raising task that hones noticing skills. Richard Schmidt\'s "Noticing Hypothesis" posits that noticing is crucial for language learning.',
    example: 'A: I stopped to smoke. B: I stopped smoking. What is the difference in meaning?',
    difficultyRating: Difficulty.C1,
  },
  [ExerciseType.PicturePrompt]: {
    name: 'Picture Prompt',
    description: 'A compelling image is shown, and the student must describe it, tell a story about it, or write questions about it. The task is open-ended and promotes creative language use.',
    pedagogy: 'A classic TBLT and Dogme ELT activity. It generates emergent language from the learner, focusing on fluency and communication with minimal materials.',
    example: 'An image of a deserted theme park. Task: "What happened here?"',
    difficultyRating: Difficulty.A2,
  },
  [ExerciseType.MoralDilemma]: {
    name: 'Moral Dilemma (TBLT)',
    description: 'A scenario posing a difficult ethical choice is presented for a student to consider and write about, explaining their reasoning.',
    pedagogy: 'A communicative TBLT activity that prioritizes fluency and expressing opinions over grammatical accuracy.',
    example: 'Your friend is cheating on a test. Do you tell the teacher? Why or why not?',
    difficultyRating: Difficulty.C1,
  },
  [ExerciseType.CollocationGapFill]: {
    name: 'Collocation Gap-Fill',
    description: 'Similar to Fill-in-the-Blank, but specifically targets common word partnerships (collocations).',
    pedagogy: 'Based on the Lexical Approach by Michael Lewis, which argues that language consists of grammaticalized lexis, not lexicalized grammar.',
    example: 'It\'s important not to [BLANK] a mistake. (do / make / have)',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.WordFormation]: {
    name: 'Word Formation',
    description: 'Students are given a root word and a sentence. They must change the form of the word to correctly complete the sentence.',
    pedagogy: 'A Lexical Approach exercise that builds word families and morphological awareness, crucial for vocabulary depth and flexibility.',
    example: 'The film was a huge [BLANK]. (disappoint) -> disappointment',
    difficultyRating: Difficulty.B2,
  },
  [ExerciseType.PhrasalVerbGapFill]: {
    name: 'Phrasal Verb Gap-Fill',
    description: 'This exercise focuses on completing a phrasal verb by choosing the correct particle (e.g., up, down, in, out).',
    pedagogy: 'A key Lexical Approach task targeting a notoriously difficult area of English. Mastering phrasal verbs is vital for fluency.',
    example: 'She decided to give [BLANK] smoking. (up / in / on)',
    difficultyRating: Difficulty.B2,
  },
  [ExerciseType.ReadingGist]: {
    name: 'Reading for Gist (Skimming)',
    description: 'Students read a text quickly to understand the main idea, ignoring unknown words and minor details.',
    pedagogy: 'A key Skills-based approach to reading. It teaches a real-world reading strategy for efficiently processing large amounts of text.',
    example: 'Read the newspaper article in 30 seconds. What is it about? A) Politics B) Sports C) Weather',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.ReadingDetail]: {
    name: 'Reading for Detail (Scanning)',
    description: 'Students search a text for specific pieces of information (like names, dates, or numbers) without reading the whole text.',
    pedagogy: 'A Skills-based approach that teaches another vital real-world reading strategy, useful for tasks like finding information on a website or in a timetable.',
    example: 'Look at the menu. How much does the pizza cost?',
    difficultyRating: Difficulty.B2,
  },
  [ExerciseType.FunctionalWriting]: {
    name: 'Functional Writing Prompt',
    description: 'Students are given a real-world scenario and must write a functional text, like an email, a note, or a complaint.',
    pedagogy: 'A communicative, Skills-based task that focuses on the practical application of writing for a specific purpose and audience.',
    example: 'Write an email to your boss requesting a day off next week. Include the date and a reason.',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.DictoGloss]: {
    name: 'Dicto-Gloss (C-R)',
    description: 'A student read a short, dense text, then hides it and tries to reconstruct it from memory. The focus is on noticing grammatical structures.',
    pedagogy: 'A powerful Consciousness-Raising task combining listening/reading and writing to force learners to pay close attention to form and structure.',
    example: 'Read: "Despite the rain, the festival went ahead." Reconstruct it from memory.',
    difficultyRating: Difficulty.C1,
  },
  [ExerciseType.CollocationOddOneOut]: {
    name: 'Collocation Odd One Out',
    description: 'A student is given a keyword and a list of other words. They must identify the word that does NOT form a common collocation.',
    pedagogy: 'A Lexical Approach exercise that sharpens a student\'s sense of which words naturally go together, improving fluency and accuracy.',
    example: 'Which word doesn\'t go with "heavy"? -> traffic, sleeper, rain, fine.',
    difficultyRating: Difficulty.B2,
  },
  [ExerciseType.InformationTransfer]: {
    name: 'Information Transfer',
    description: 'A student reads a text (e.g., a schedule, an ad) and transfers key information into a different format, like a form or a chart.',
    pedagogy: 'An Input-based task that tests comprehension in a practical way without requiring extensive writing, mimicking real-life information-gathering.',
    example: 'Read the event flyer, then fill in the fields: Event Name, Date, Location.',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.ListeningSpecificInfo]: {
    name: 'Listening for Specific Info',
    description: 'A student listens to a short audio clip (e.g., an announcement) to find specific pieces of information to answer questions.',
    pedagogy: 'A fundamental Skills-based exercise that develops the real-world sub-skill of listening for details, crucial for comprehension in daily life.',
    example: 'Listen to the announcement. What platform does the train to London depart from?',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.ProblemSolvingScenario]: {
    name: 'Problem-Solving Scenario',
    description: 'A student is presented with a problem or unusual situation and must write about how they would solve it or what they would do.',
    pedagogy: 'A Task-Based Learning (TBLT) activity that encourages creative thinking and the use of language for practical, communicative purposes like suggesting, explaining, and justifying.',
    example: 'You are locked in a room with a candle, a rope, and a newspaper. How do you escape?',
    difficultyRating: Difficulty.C1,
  },
  // Communicative Production
  [ExerciseType.RolePlayScenario]: {
    name: 'Role-Play Scenario',
    description: 'A student is given a character, a situation, and a goal, and must write what they would say. This pushes them to produce context-appropriate language.',
    pedagogy: 'Based on Merrill Swain\'s "Pushed Output Hypothesis," this task forces learners to produce coherent language, helping them notice gaps in their knowledge.',
    example: 'You are a customer returning a faulty TV. Write the conversation with the store manager.',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.StorytellingFromPrompts]: {
    name: 'Storytelling from Prompts',
    description: 'Given a few keywords or short phrases, the student must write a coherent story that connects them.',
    pedagogy: 'A Production task that encourages creativity and pushes learners to use narrative tenses and cohesive devices to link ideas.',
    example: 'Write a short story that includes: a key, a broken clock, and a surprise visitor.',
    difficultyRating: Difficulty.C1,
  },
  [ExerciseType.JustifyYourOpinion]: {
    name: 'Justify Your Opinion',
    description: 'A student is presented with a statement and must write a response that justifies their agreement or disagreement with supporting arguments.',
    pedagogy: 'This "Pushed Output" task develops the language of persuasion, argumentation, and justification, which is essential for academic and formal contexts.',
    example: 'Statement: "Social media does more harm than good." Do you agree or disagree? Justify your opinion.',
    difficultyRating: Difficulty.C1,
  },
  [ExerciseType.PictureComparison]: {
    name: 'Picture Comparison',
    description: 'A student is given descriptions of two related but different scenes and must write a paragraph comparing and contrasting them.',
    pedagogy: 'A Production task that pushes learners to use comparative/contrastive language and modals of speculation, developing descriptive and analytical skills.',
    example: 'Scene A is a 1950s kitchen. Scene B is a modern kitchen. Compare them.',
    difficultyRating: Difficulty.C1,
  },
  // Pragmatics & Social English
  [ExerciseType.FunctionMatching]: {
    name: 'Function Matching',
    description: 'Students match phrases or utterances to their social function (e.g., apologizing, suggesting, complaining).',
    pedagogy: 'A Pragmatics exercise focused on communicative competence. It teaches that the function of an utterance often depends on the social context.',
    example: 'Match "I\'m afraid I can\'t" to its function: a) Apologizing, b) Complaining, c) Polite Refusal.',
    difficultyRating: Difficulty.B1,
  },
  [ExerciseType.RegisterSort]: {
    name: 'Register Sort',
    description: 'Students are given a list of words or phrases and must sort them into categories like "Formal," "Neutral," and "Informal."',
    pedagogy: 'This Pragmatics task raises awareness of register, a key aspect of social appropriacy. It helps learners choose the right language for the right situation.',
    example: 'Sort these words: purchase, buy, get, obtain. (Formal vs. Informal)',
    difficultyRating: Difficulty.B2,
  },
  [ExerciseType.PolitenessScenarios]: {
    name: 'Politeness Scenarios',
    description: 'Given a social situation, the student must choose the most appropriate (e.g., most polite) utterance from a set of options.',
    pedagogy: 'This Pragmatics exercise directly teaches politeness strategies and helps learners navigate tricky social situations by understanding indirectness and tone.',
    example: 'You need to interrupt your boss. What do you say? a) "Excuse me..." b) "Hey!" c) "I need to talk."',
    difficultyRating: Difficulty.B2,
  },
  [ExerciseType.InferringMeaning]: {
    name: 'Inferring Meaning (Reading Between the Lines)',
    description: 'A student reads a short dialogue where the true meaning is implied, not stated directly, and must choose the correct interpretation.',
    pedagogy: 'This Pragmatics task targets \'implicature,\' a core skill for understanding indirect communication and what people mean, not just what they say.',
    example: 'A: \'Are you coming to the party?\' B: \'I have a huge exam tomorrow.\' Meaning: B is not coming.',
    difficultyRating: Difficulty.Suffering,
  }
};
