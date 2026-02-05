import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExercises } from '../geminiService';
import { ExerciseType, Difficulty, Tone } from '../../enums';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the GoogleGenerativeAI class and its methods
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
    SchemaType: {
      STRING: 'STRING',
      ARRAY: 'ARRAY',
      OBJECT: 'OBJECT',
    },
    Modality: {
        IMAGE: 'IMAGE'
    }
  };
});

describe('geminiService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockGenerateContent.mockClear();
    mockGetGenerativeModel.mockClear();
    // Clear the class mock
    (GoogleGenerativeAI as any).mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
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

  it('should call Gemini API when API_KEY is present', async () => {
    process.env.API_KEY = 'test-key';

    // Mock successful response
    const mockResponse = {
      response: {
        text: () => JSON.stringify([{ question: 'Test?', answer: 'Yes', wordBank: ['Yes', 'No'] }]),
      },
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

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

    // Verify instantiation
    // expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-key');
    // Verify model retrieval
    // expect(mockGetGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({ model: 'gemini-2.0-flash' }));
    // Verify generation
    expect(mockGenerateContent).toHaveBeenCalled();

    // Verify result parsing
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe('Test?');
  });

  it('should handle API errors gracefully', async () => {
     process.env.API_KEY = 'test-key';
     mockGenerateContent.mockRejectedValue(new Error('API Error'));

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
