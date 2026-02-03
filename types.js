"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tone = exports.Difficulty = exports.ExerciseType = void 0;
var ExerciseType;
(function (ExerciseType) {
    ExerciseType["FITB"] = "Fill-in-the-Blank";
    ExerciseType["MultipleChoice"] = "Multiple Choice";
    ExerciseType["SentenceScramble"] = "Sentence Scramble";
    ExerciseType["ClozeParagraph"] = "Cloze Paragraph";
    ExerciseType["Matching"] = "Matching";
    ExerciseType["ErrorCorrection"] = "Error Correction";
    ExerciseType["DialogueCompletion"] = "Dialogue Completion";
    ExerciseType["StorySequencing"] = "Story Sequencing";
    ExerciseType["Prediction"] = "Prediction (What Happens Next?)";
    ExerciseType["RuleDiscovery"] = "Rule Discovery (C-R)";
    ExerciseType["SpotTheDifference"] = "Spot the Difference (C-R)";
    ExerciseType["DictoGloss"] = "Dicto-Gloss (C-R)";
    ExerciseType["PicturePrompt"] = "Picture Prompt";
    ExerciseType["MoralDilemma"] = "Moral Dilemma (TBLT)";
    ExerciseType["ProblemSolvingScenario"] = "Problem-Solving Scenario";
    ExerciseType["CollocationGapFill"] = "Collocation Gap-Fill";
    ExerciseType["WordFormation"] = "Word Formation";
    ExerciseType["PhrasalVerbGapFill"] = "Phrasal Verb Gap-Fill";
    ExerciseType["CollocationOddOneOut"] = "Collocation Odd One Out";
    ExerciseType["InformationTransfer"] = "Information Transfer";
    ExerciseType["ReadingGist"] = "Reading for Gist (Skimming)";
    ExerciseType["ReadingDetail"] = "Reading for Detail (Scanning)";
    ExerciseType["ListeningSpecificInfo"] = "Listening for Specific Info";
    ExerciseType["FunctionalWriting"] = "Functional Writing Prompt";
    // Communicative Production Types
    ExerciseType["RolePlayScenario"] = "Role-Play Scenario";
    ExerciseType["StorytellingFromPrompts"] = "Storytelling from Prompts";
    ExerciseType["JustifyYourOpinion"] = "Justify Your Opinion";
    ExerciseType["PictureComparison"] = "Picture Comparison";
    // Pragmatics Types
    ExerciseType["FunctionMatching"] = "Function Matching";
    ExerciseType["RegisterSort"] = "Register Sort";
    ExerciseType["PolitenessScenarios"] = "Politeness Scenarios";
    ExerciseType["InferringMeaning"] = "Inferring Meaning";
})(ExerciseType || (exports.ExerciseType = ExerciseType = {}));
var Difficulty;
(function (Difficulty) {
    Difficulty["A1"] = "A1";
    Difficulty["A2"] = "A2";
    Difficulty["B1"] = "B1";
    Difficulty["B2"] = "B2";
    Difficulty["C1"] = "C1";
    Difficulty["C2"] = "C2";
    Difficulty["Suffering"] = "Suffering";
})(Difficulty || (exports.Difficulty = Difficulty = {}));
var Tone;
(function (Tone) {
    Tone["Casual"] = "Casual";
    Tone["Formal"] = "Formal";
    Tone["Academic"] = "Academic";
})(Tone || (exports.Tone = Tone = {}));
