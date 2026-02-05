import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExercises } from '../mistralService';
import { ExerciseType, Difficulty, Tone } from '../../enums';

describe('mistralService', () => {
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

    it('should use dummy data when MISTRAL_API_KEY is missing', async () => {
        delete process.env.MISTRAL_API_KEY;
         const result = await generateExercises(
            ExerciseType.FITB,
            Difficulty.A1,
            Tone.Casual,
            'test theme',
            1,
            [],
            0,
            [],
            0
        );
        expect(result).toHaveLength(1);
        expect(result[0].question).toContain('This is a [BLANK] sentence');
    });

    it('should call Mistral API when key is present', async () => {
        process.env.MISTRAL_API_KEY = 'mistral-key';

        const mockResponse = {
            ok: true,
            json: async () => ({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            result: [{ question: 'Mistral Q?', answer: 'A', wordBank: ['A', 'B'] }]
                        })
                    }
                }]
            })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await generateExercises(
            ExerciseType.FITB,
            Difficulty.A1,
            Tone.Casual,
            'test theme',
            1,
            [],
            0,
            [],
            0
        );

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.mistral.ai/v1/chat/completions",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    "Authorization": "Bearer mistral-key"
                })
            })
        );
        expect(result).toHaveLength(1);
        expect(result[0].question).toBe('Mistral Q?');
    });
});
