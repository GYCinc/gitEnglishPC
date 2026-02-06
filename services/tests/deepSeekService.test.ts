import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExercises } from '../deepSeekService';
import { ExerciseType, Difficulty, Tone } from '../../enums';

describe('deepSeekService', () => {
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

  it('should use dummy data when DEEPSEEK_API_KEY is missing', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const result = await generateExercises(
      ExerciseType.FITB,
      Difficulty.A1,
      Tone.Casual,
      'test',
      1,
      [],
      0,
      [],
      0
    );
    expect(result).toHaveLength(1);
    expect(result[0].question).toContain('DeepSeek Dummy Question');
  });

  it('should call DeepSeek API when key is present', async () => {
    process.env.DEEPSEEK_API_KEY = 'ds-key';

    const mockResponse = {
        ok: true,
        json: async () => ({
            choices: [{
                message: {
                    content: JSON.stringify([{ question: 'DS Q?', answer: 'A' }])
                }
            }]
        })
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await generateExercises(
      ExerciseType.FITB,
      Difficulty.A1,
      Tone.Casual,
      'test',
      1,
      [],
      0,
      [],
      0
    );

    expect(global.fetch).toHaveBeenCalledWith(
        "https://api.deepseek.com/v1/chat/completions",
        expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({ "Authorization": "Bearer ds-key" })
        })
    );
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe('DS Q?');
  });
});
