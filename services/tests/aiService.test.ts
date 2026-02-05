import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExercises } from '../aiService';
import * as mistral from '../mistralService';
import * as gemini from '../geminiService';
import { ExerciseType, Difficulty, Tone } from '../../enums';

vi.mock('../mistralService');
vi.mock('../geminiService');

describe('aiService', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        vi.clearAllMocks();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should prefer Mistral if MISTRAL_API_KEY is set', async () => {
        process.env.MISTRAL_API_KEY = 'exists';
        process.env.API_KEY = 'exists'; // Gemini also exists

        await generateExercises(
            ExerciseType.FITB, Difficulty.A1, Tone.Casual, 'test', 1, [], 0, [], 0
        );

        expect(mistral.generateExercises).toHaveBeenCalled();
        expect(gemini.generateExercises).not.toHaveBeenCalled();
    });

    it('should fallback to Gemini if MISTRAL_API_KEY is missing', async () => {
        delete process.env.MISTRAL_API_KEY;
        process.env.API_KEY = 'exists';

        await generateExercises(
            ExerciseType.FITB, Difficulty.A1, Tone.Casual, 'test', 1, [], 0, [], 0
        );

        expect(mistral.generateExercises).not.toHaveBeenCalled();
        expect(gemini.generateExercises).toHaveBeenCalled();
    });
});
