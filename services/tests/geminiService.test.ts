import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExercises } from '../geminiService';
import { ExerciseType, Difficulty, Tone } from '../../enums';

describe('geminiService', () => {
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

  it('should use dummy data when API_KEY is missing', async () => {
    delete process.env.API_KEY;
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

  it('should call Gemini REST API when API_KEY is present', async () => {
    process.env.API_KEY = 'test-key';

    const mockResponse = {
        ok: true,
        json: async () => ({
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify([{ question: 'REST Q?', answer: 'A', wordBank: ['A'] }])
                    }]
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
        expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'),
        expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
    );
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe('REST Q?');
  });

  it('should handle REST API errors gracefully', async () => {
     process.env.API_KEY = 'test-key';
     const mockResponse = {
         ok: false,
         statusText: "Bad Request"
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

    expect(result).toHaveProperty('error');
  });
});
