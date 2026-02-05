import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateExercises, checkAnswerWithAI } from '../aiService';
import * as mistral from '../mistralService';
import * as deepseek from '../deepSeekService';
import { ExerciseType, Difficulty, Tone } from '../../enums';

vi.mock('../mistralService');
vi.mock('../deepSeekService');

describe('aiService Routing', () => {
    it('should route generateExercises to DeepSeek', async () => {
        await generateExercises(
            ExerciseType.FITB, Difficulty.A1, Tone.Casual, 'test', 1, [], 0, [], 0
        );
        expect(deepseek.generateExercises).toHaveBeenCalled();
        expect(mistral.generateExercises).not.toHaveBeenCalled();
    });

    it('should route checkAnswerWithAI to Mistral', async () => {
        await checkAnswerWithAI('type', {}, 'response');
        expect(mistral.checkAnswerWithAI).toHaveBeenCalled();
        // DeepSeek doesn't have checkAnswer exported/mocked in this context but logically we check mistral was called
    });
});
