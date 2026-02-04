import { ExerciseType, Difficulty, Tone } from '../types';

// Ensure MISTRAL_API_KEY is set in the environment
const apiKey = process.env.MISTRAL_API_KEY || "DUMMY_KEY_FOR_VERIFICATION";
if (!process.env.MISTRAL_API_KEY) {
  console.warn("MISTRAL_API_KEY environment variable not set. Mistral API calls will fail or be mocked.");
}

/**
 * Constructs the prompt and schema for exercise generation based on input parameters.
 * Enforces CEFR guidelines and strict American English.
 */
const getPromptAndSchema = (
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
- Target Grammar: [${focusGrammar.join(', ')}]
- Inclusion Rate: Approximately ${grammarInclusionRate}% of the exercises should be designed to practice or elicit the use of the Target Grammar points.
- For the remaining content, ensure it is grammatically correct according to standard English rules for the specified difficulty level.`;
  }


  // Define schema for each exercise type to ensure structured JSON output
  switch (exerciseType) {
    case ExerciseType.FITB:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide a sentence with a single '[BLANK]', the correct answer, and a 'wordBank' array containing the correct answer plus 2-3 incorrect distractor words. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string', description: "The sentence with a '[BLANK]' for the missing word." },
                  answer: { type: 'string', description: "The word that fits in the blank." },
                  wordBank: { type: 'array', items: { type: 'string' }, description: "An array with the correct answer and 2-3 distractors." },
                },
                required: ["question", "answer", "wordBank"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.CollocationGapFill:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} The focus is on common collocations (word partnerships). For each item, provide a sentence with a '[BLANK]' where a key part of a common collocation is missing. Provide the 'collocation' itself (e.g., "make a decision"), the 'answer' word, and a 'wordBank' with the answer and 2-3 distractors. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string', description: "The sentence with a '[BLANK]' where a collocate is missing." },
                  answer: { type: 'string', description: "The word that completes the collocation." },
                  wordBank: { type: 'array', items: { type: 'string' }, description: "An array with the correct answer and 2-3 distractors." },
                  collocation: { type: 'string', description: "The full collocation, e.g., 'heavy rain'." }
                },
                required: ["question", "answer", "wordBank", "collocation"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.PhrasalVerbGapFill:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} The focus is on common phrasal verbs. For each item, provide a sentence with a '[BLANK]' where the particle is missing. Provide the 'phrasalVerb' itself (e.g., "give up"), the 'answer' particle, and a 'wordBank' with the answer and 2-3 distractor particles. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string', description: "The sentence with a '[BLANK]' where a particle is missing." },
                  answer: { type: 'string', description: "The particle that completes the phrasal verb." },
                  wordBank: { type: 'array', items: { type: 'string' }, description: "An array with the correct particle and 2-3 distractors." },
                  phrasalVerb: { type: 'string', description: "The full phrasal verb, e.g., 'give up'." }
                },
                required: ["question", "answer", "wordBank", "phrasalVerb"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.WordFormation:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} The focus is on word formation. For each item, provide a sentence with a '[BLANK]', a 'rootWord' in parentheses, and the 'answer' which is the correct form of the root word for the context. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string', description: "The sentence with a '[BLANK]' for the missing word form." },
                  rootWord: { type: 'string', description: "The base word to be transformed." },
                  answer: { type: 'string', description: "The correctly formed word that fits in the blank." },
                },
                required: ["question", "rootWord", "answer"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.MultipleChoice:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide a question, an array of four 'options' (three incorrect, one correct), and the 'correctAnswer'. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string', description: "The question or sentence to complete." },
                  options: { type: 'array', items: { type: 'string' }, description: "An array of 4 choices (3 incorrect, 1 correct)." },
                  correctAnswer: { type: 'string', description: "The correct answer from the options." },
                },
                required: ["question", "options", "correctAnswer"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.SentenceScramble:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide a 'scrambledWords' array of words in a random order, and the 'correct' sentence. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scrambledWords: { type: 'array', items: { type: 'string' }, description: "An array of words for a sentence in a random order." },
                  correct: { type: 'string', description: "The correctly formed sentence." },
                },
                required: ["scrambledWords", "correct"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.ClozeParagraph:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each exercise, provide a single paragraph with multiple '[BLANK]' placeholders, an ordered 'answers' array for the blanks, and a 'wordBank' array containing all the correct answers plus 3-4 extra distractor words. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  paragraph: { type: 'string', description: "The paragraph with multiple '[BLANK]' placeholders." },
                  answers: { type: 'array', items: { type: 'string' }, description: "An ordered list of answers for the blanks." },
                  wordBank: { type: 'array', items: { type: 'string' }, description: "An array of all correct answers and some distractors, shuffled." },
                },
                required: ["paragraph", "answers", "wordBank"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.Matching:
    case ExerciseType.FunctionMatching:
      const matchingPromptType = exerciseType === ExerciseType.FunctionMatching ? 'phrases to their social functions' : 'items';
      const matchingBasePrompt = basePrompt.replace('English exercises for an ESL learner\'s self-study.', `a single matching exercise with ${amount} pairs of ${matchingPromptType}.`);
      return {
        prompt: matchingBasePrompt,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prompts: { type: 'array', items: { type: 'string' }, description: "A list of prompts (e.g., words, questions, phrases)." },
                  answers: { type: 'array', items: { type: 'string' }, description: "A corresponding list of answers (e.g., definitions, responses, social functions)." },
                },
                required: ["prompts", "answers"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.ErrorCorrection:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide a sentence with a single grammatical error and the corrected version of the sentence. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  incorrectSentence: { type: 'string', description: "A sentence with one grammatical error." },
                  correctSentence: { type: 'string', description: "The corrected version of the sentence." },
                },
                required: ["incorrectSentence", "correctSentence"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.DialogueCompletion:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each exercise, provide a short dialogue with one or more '[BLANK]' placeholders, an ordered 'answers' array for the blanks, and a 'wordBank' array containing all correct answers plus 2-3 extra distractor words. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  dialogue: { type: 'string', description: "A dialogue with '[BLANK]' placeholders." },
                  answers: { type: 'array', items: { type: 'string' }, description: "An ordered list of answers for the blanks." },
                  wordBank: { type: 'array', items: { 'type': 'string' }, description: "An array of all correct answers and some distractors, shuffled." },
                },
                required: ["dialogue", "answers", "wordBank"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.StorySequencing:
      const storySeqPrompt = basePrompt.replace('English exercises', `a single short story, divided into ${amount} paragraphs/parts`);
      return {
        prompt: `${storySeqPrompt}\nProvide a 'title' for the story and a 'storyParts' array containing the paragraphs in the correct narrative order. The number of elements in the array should be exactly ${amount}.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: "The title of the story." },
                  storyParts: { type: 'array', items: { type: 'string' }, description: "An array of strings, where each string is a part of the story in correct chronological order." },
                },
                required: ["title", "storyParts"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.Prediction:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide a 'storyStart' which is the beginning of a story. Then provide three possible continuations in an 'options' array (two illogical, one logical), and the 'correctAnswer' which is the logical continuation. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  storyStart: { type: 'string', description: "The beginning of a story." },
                  options: { type: 'array', items: { type: 'string' }, description: "An array of 3 choices for what happens next." },
                  correctAnswer: { type: 'string', description: "The most logical continuation of the story from the options." },
                },
                required: ["storyStart", "options", "correctAnswer"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.RuleDiscovery:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, generate a set of 3-4 example 'sentences' that clearly demonstrate a single, specific grammar rule. Then, provide a 'question' that asks the learner to identify the rule, an array of three 'options' describing possible rules (one correct, two incorrect), and the 'correctAnswer'. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sentences: { type: 'array', items: { type: 'string' }, description: "An array of 3-4 example sentences demonstrating a grammar rule." },
                  question: { type: 'string', description: "A question asking to identify the rule." },
                  options: { type: 'array', items: { type: 'string' }, description: "An array of 3 possible rules (1 correct, 2 incorrect)." },
                  correctAnswer: { type: 'string', description: "The correct rule description." },
                },
                required: ["sentences", "question", "options", "correctAnswer"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.SpotTheDifference:
      return {
        prompt: `${basePrompt.replace('English exercises', '1 English exercise')} For each item, provide two sentences, 'sentenceA' and 'sentenceB', that have a subtle but important grammatical difference that changes the meaning. Then provide a 'question' about the difference in meaning, an array of three 'options' explaining the difference (one correct), and the 'correctAnswer'. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sentenceA: { type: 'string' },
                  sentenceB: { type: 'string' },
                  question: { type: 'string', description: "A question about the meaning change." },
                  options: { type: 'array', items: { type: 'string' }, description: "An array of 3 explanations for the difference." },
                  correctAnswer: { type: 'string', description: "The correct explanation." },
                },
                required: ["sentenceA", "sentenceB", "question", "options", "correctAnswer"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.MoralDilemma:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single, classic moral dilemma suitable for discussion by ESL students.')}\nProvide a 'title' for the dilemma and the 'dilemma' text itself, which should clearly outline the scenario and the difficult choice to be made. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  dilemma: { type: 'string', description: "The text of the moral dilemma." },
                },
                required: ["title", "dilemma"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.ReadingGist:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single short text (100-150 words) suitable for a "Reading for Gist" exercise. The student\'s goal is to quickly understand the main idea.')}\nProvide a 'title', the full 'text', a single multiple-choice 'question' about the main idea of the text, an array of three 'options' (one correct), and the 'correctAnswer'.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  text: { type: 'string', description: "The full text for the reading exercise." },
                  question: { type: 'string', description: "A multiple-choice question about the main idea." },
                  options: { type: 'array', items: { type: 'string' } },
                  correctAnswer: { type: 'string' },
                },
                required: ["title", "text", "question", "options", "correctAnswer"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.ReadingDetail:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single text (e.g., an advertisement, a short bio, a schedule, a menu) suitable for a "Reading for Detail" (Scanning) exercise. The student\'s goal is to find specific information.')}\nProvide a 'title', the full 'text', and an array of 3-4 'questions'. Each question object in the array should have a 'question' string and a short 'answer' string.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  text: { type: 'string', description: "The text containing specific details." },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question: { type: 'string' },
                        answer: { type: 'string' },
                      },
                      required: ["question", "answer"],
                    },
                  },
                },
                required: ["title", "text", "questions"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.FunctionalWriting:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single "Functional Writing" prompt.')}\nProvide a 'title' for the task, a 'scenario' that explains the context, and a clear 'task' that tells the student exactly what to write (e.g., "Write an email... include these 3 points...").`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  scenario: { type: 'string', description: "The context for the writing task." },
                  task: { type: 'string', description: "The specific writing instructions." },
                },
                required: ["title", "scenario", "task"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.DictoGloss:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single short, grammatically dense paragraph (3-5 sentences) for a \'Dicto-Gloss\' exercise. The text should contain interesting structures.')}\nProvide a 'title' and the 'text'.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  text: { type: 'string', description: "A short, grammatically dense text for reconstruction." },
                },
                required: ["title", "text"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.CollocationOddOneOut:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a \'Collocation Odd One Out\' exercise.')}\nProvide a 'keyword'. Then provide an 'options' array of 4 words: 3 that form a strong collocation with the keyword, and 1 that does not. Provide the 'correctAnswer', which is the word that does NOT collocate. Generate ${amount} items.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  keyword: { type: 'string', description: "The central word for the collocation." },
                  options: { type: 'array', items: { type: 'string' }, description: "4 words: 3 that collocate, 1 that does not." },
                  correctAnswer: { type: 'string', description: "The word from the options that does NOT collocate with the keyword." },
                },
                required: ["keyword", "options", "correctAnswer"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.InformationTransfer:
      return {
        prompt: `${basePrompt.replace('English exercises', 'an \'Information Transfer\' exercise.')}\nProvide a 'title' and a 'text' containing several specific pieces of information (like a short biography, an event schedule, or a product description). Then, provide an array of 'formFields' which are labels for the information the student needs to extract from the text (e.g., ["Name", "Date of Birth", "Occupation"]).`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  text: { type: 'string', description: "A text rich with specific details." },
                  formFields: { type: 'array', items: { type: 'string' }, description: "An array of labels for the information to be extracted." },
                },
                required: ["title", "text", "formFields"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.ListeningSpecificInfo:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a \'Listening for Specific Information\' exercise.')}\nProvide a 'title' and a short 'audioText' (like a public announcement, a phone message, or a weather report) to be read aloud. Then, provide an array of 2-3 'questions'. Each question object in the array should have a 'question' string and a short 'answer' string.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  audioText: { type: 'string', description: "The script to be read aloud for the listening task." },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question: { type: 'string' },
                        answer: { type: 'string' },
                      },
                      required: ["question", "answer"],
                    },
                  },
                },
                required: ["title", "audioText", "questions"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.ProblemSolvingScenario:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a \'Problem-Solving Scenario\' for a TBLT self-study task. Create a clear, concise scenario where the learner is faced with a problem that requires a creative or logical solution.')}\nProvide a 'title' and the 'scenario' text.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  scenario: { type: 'string', description: "The text of the problem-solving scenario." },
                },
                required: ["title", "scenario"],
              },
            },
          },
          required: ["result"],
        },
      };
    // PRODUCTION SCHEMAS
    case ExerciseType.RolePlayScenario:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single role-play scenario.')}\nProvide a 'title', the 'character' the learner should play, the 'situation' they are in, and a specific 'task' to complete.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  character: { type: 'string', description: "The character the learner plays." },
                  situation: { type: 'string', description: "The context of the role-play." },
                  task: { type: 'string', description: "The specific instruction for what to write." },
                },
                required: ["title", "character", "situation", "task"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.StorytellingFromPrompts:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single storytelling exercise.')}\nProvide a 'title', an array of 3-4 'prompts' (keywords or short phrases), and a 'task' instructing the learner to write a story connecting them.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  prompts: { type: 'array', items: { type: 'string' }, description: "3-4 keywords or phrases to include in a story." },
                  task: { type: 'string', description: "The specific instruction to write a story." },
                },
                required: ["title", "prompts", "task"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.JustifyYourOpinion:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single exercise for justifying an opinion.')}\nProvide a 'title', a debatable 'statement', and a 'task' asking the learner to agree or disagree and justify their position.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  statement: { type: 'string', description: "A debatable statement." },
                  task: { type: 'string', description: "Instruction to agree/disagree and justify." },
                },
                required: ["title", "statement", "task"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.PictureComparison:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single picture comparison exercise.')}\nProvide a 'title', a rich description for 'promptA' (Scene 1), and a rich description for 'promptB' (Scene 2). The scenes should be related but different. Also provide a 'task' asking the learner to compare and contrast the two scenes.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  promptA: { type: 'string', description: "Rich description of the first scene." },
                  promptB: { type: 'string', description: "Rich description of the second, related scene." },
                  task: { type: 'string', description: "Instruction to compare and contrast the scenes." },
                },
                required: ["title", "promptA", "promptB", "task"],
              },
            },
          },
          required: ["result"],
        },
      };
    // PRAGMATICS SCHEMAS
    case ExerciseType.RegisterSort:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single register sort exercise.')}\nProvide a 'title', an array of 'categories' (e.g., "Formal", "Informal", "Neutral"), an array of 6-8 'phrases' to be sorted, and a 'solution' array mapping each phrase to its correct category.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  categories: { type: 'array', items: { type: 'string' } },
                  phrases: { type: 'array', items: { type: 'string' } },
                  solution: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        phrase: { type: 'string' },
                        category: { type: 'string' },
                      },
                      required: ["phrase", "category"]
                    }
                  }
                },
                required: ["title", "categories", "phrases", "solution"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.PolitenessScenarios:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single politeness scenario as a multiple-choice question.')}\nProvide a 'scenario' describing a social situation, a 'question' asking for the most appropriate utterance, an array of 3 'options' with varying levels of politeness, and the 'correctAnswer'.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scenario: { type: 'string', description: "The social context." },
                  question: { type: 'string', description: "The question asking for the best response." },
                  options: { type: 'array', items: { type: 'string' } },
                  correctAnswer: { type: 'string' },
                },
                required: ["scenario", "question", "options", "correctAnswer"],
              },
            },
          },
          required: ["result"],
        },
      };
    case ExerciseType.InferringMeaning:
      return {
        prompt: `${basePrompt.replace('English exercises', 'a single exercise for inferring meaning.')}\nProvide a short 'dialogue' where one speaker implies something without saying it directly. Then provide a 'question' asking what the speaker means, an array of 3 'options', and the 'correctAnswer' which is the correct inference.`,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  dialogue: { type: 'string', description: "A short dialogue with an implied meaning." },
                  question: { type: 'string', description: "A question asking for the implied meaning." },
                  options: { type: 'array', items: { type: 'string' } },
                  correctAnswer: { type: 'string' },
                },
                required: ["dialogue", "question", "options", "correctAnswer"],
              },
            },
          },
          required: ["result"],
        },
      };
    default:
      throw new Error("Unsupported exercise type");
  }
};

/**
 * Generates exercises using the Mistral API.
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
  if (process.env.MISTRAL_API_KEY === undefined) {
      console.warn("Using DUMMY data for verification as MISTRAL_API_KEY is missing.");
      // Dummy data map for verification
      if (exerciseType === ExerciseType.FITB) {
          return Array.from({ length: amount }).map((_, i) => ({
              question: `This is a [BLANK] sentence #${i+1}.`,
              answer: "dummy",
              wordBank: ["dummy", "fake", "wrong", "test"]
          }));
      }
      if (exerciseType === ExerciseType.Matching) {
          return Array.from({ length: amount }).map((_, i) => ({
              prompts: [`Prompt A #${i+1}`, `Prompt B #${i+1}`, `Prompt C #${i+1}`],
              answers: [`Answer A #${i+1}`, `Answer B #${i+1}`, `Answer C #${i+1}`]
          }));
      }
      if (exerciseType === ExerciseType.MultipleChoice) {
          return Array.from({ length: amount }).map((_, i) => ({
              question: `What is the correct answer for question #${i+1}?`,
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: "Option A"
          }));
      }
      // Add more dummy data types if needed, otherwise fallback to error
      return { error: "Dummy data not implemented for this type." };
  }

  try {
    // Handle image generation separately for PicturePrompt exercise
    if (exerciseType === ExerciseType.PicturePrompt) {
      // For now, we'll return a placeholder since Mistral doesn't support image generation
      const generatedExercises = [];
      for (let i = 0; i < amount; i++) {
        const imagePrompt = `A compelling and slightly ambiguous scene about "${theme}". The style should be ${tone}. The image is for an ESL student at a ${difficulty} level to analyze. ${i > 0 ? `Variation ${i + 1}.` : ''}`;
        
        // Since Mistral doesn't support image generation, we'll return a placeholder
        generatedExercises.push({
          title: `Picture Prompt #${i + 1}`,
          imageUrl: `https://placehold.co/600x400?text=${encodeURIComponent(theme)}`,
          prompt: imagePrompt
        });
      }
      if (generatedExercises.length === 0) {
        return { error: "Failed to generate any images for the picture prompt." };
      }
      return generatedExercises;
    }

    // Get prompt and schema for text-based exercises
    const { prompt, schema } = getPromptAndSchema(exerciseType, difficulty, tone, theme, amount, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate);

    // Call Mistral API for content generation
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest", // Using Mistral's most capable model
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: {
          type: "json_object",
          schema: schema
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Extract the result array from the response
    return parsed.result || parsed;
  } catch (error) {
    console.error("Error generating exercises:", error);
    if (error instanceof Error && error.message.includes('MISTRAL_API_KEY')) {
        return { error: "MISTRAL_API_KEY is not valid. Please check your environment configuration." };
    }
    return { error: "Failed to generate exercises. The model may be overloaded or the request is invalid. Please try again later." };
  }
};

/**
 * Checks a user's answer for an exercise using the Mistral API.
 * Returns a JSON string with feedback and correctness.
 */
export const checkAnswerWithAI = async (
  exerciseType: string,
  exerciseContext: any,
  userResponse: any
): Promise<string> => { // Keep string return type but formatted as JSON now
  if (process.env.MISTRAL_API_KEY === undefined) {
      return JSON.stringify({
          isCorrect: true,
          feedback: "This is dummy feedback because the MISTRAL_API_KEY is missing. Great job!"
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
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest", // Using Mistral's efficient model for quick feedback
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 512,
        response_format: {
          type: "json_object"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error checking answer:", error);
    return JSON.stringify({
        isCorrect: false,
        feedback: "Could not retrieve feedback at this time."
    });
  }
};