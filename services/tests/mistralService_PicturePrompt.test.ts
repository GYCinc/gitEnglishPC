import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExercises } from '../mistralService';
import { ExerciseType, Difficulty, Tone } from '../../enums';

describe('mistralService - PicturePrompt', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        global.fetch = vi.fn();
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it('should generate PicturePrompt exercises with Pollinations.ai URLs', async () => {
        const theme = 'mystery mansion';
        const tone = Tone.Formal;
        const difficulty = Difficulty.B2;
        const amount = 2;

        const result = await generateExercises(
            ExerciseType.PicturePrompt,
            difficulty,
            tone,
            theme,
            amount,
            [],
            0,
            [],
            0
        );

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(amount);

        const firstExercise = result[0];
        expect(firstExercise.imageUrl).toContain('https://image.pollinations.ai/prompt/');
        expect(firstExercise.imageUrl).toContain(encodeURIComponent(theme));
        expect(firstExercise.imageUrl).toContain('width=600');
        expect(firstExercise.imageUrl).toContain('height=400');

        // Ensure prompt text is also present
        expect(firstExercise.prompt).toContain(theme);
        expect(firstExercise.prompt).toContain(tone);
        expect(firstExercise.prompt).toContain(difficulty);
    });

    it('should handle variations correctly', async () => {
        const result = await generateExercises(
            ExerciseType.PicturePrompt,
            Difficulty.B1,
            Tone.Casual,
            'test',
            2,
            [],
            0,
            [],
            0
        );

        expect(result[0].title).toBe('Picture Prompt #1');
        expect(result[1].title).toBe('Picture Prompt #2');

        // Check if URL contains variations (implicit via prompt encoding)
        // Since prompt is encoded, we check specific parts or ensure they differ
        expect(result[0].imageUrl).not.toBe(result[1].imageUrl);
    });
});
