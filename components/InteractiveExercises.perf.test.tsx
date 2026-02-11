import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { InteractiveMCQ } from './InteractiveExercises';
import { ExerciseType, IMultipleChoiceExercise, Difficulty, Tone } from '../types';

// Mock Gamification
vi.mock('../GamificationContext', () => ({
  useGamification: () => ({
    addXP: vi.fn(),
    checkStreak: vi.fn(),
  }),
}));

// Mock Sound Effects
vi.mock('../services/SoundEffectsService', () => ({
  soundEffects: {
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
  },
}));

describe('InteractiveMCQ Performance', () => {
    it('renders and updates efficiently with many options', async () => {
        const optionCount = 2000;
        const options = Array.from({ length: optionCount }, (_, i) => `Option ${i}`);
        const exercise: IMultipleChoiceExercise = {
            question: "Choose the correct option",
            options: options,
            correctAnswer: "Option 0",
        };

        const colors = {
            chip: { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-200' },
            textOnLight: 'text-slate-900',
        };

        const startRender = performance.now();
        const { getByText, rerender } = render(<InteractiveMCQ exercise={exercise} colors={colors} />);
        const endRender = performance.now();
        console.log(`Initial render time: ${(endRender - startRender).toFixed(2)}ms`);

        const firstOption = getByText('Option 0');

        const startClick = performance.now();
        // Wrap in act to ensure updates are processed
        act(() => {
            fireEvent.click(firstOption);
        });
        const endClick = performance.now();
        console.log(`Update (click) time: ${(endClick - startClick).toFixed(2)}ms`);

        // Force another re-render by changing props (if possible) or just verify the state
        // In the real app, parent might re-render. Let's simulate parent re-render.
        const startRerender = performance.now();
        for (let i = 0; i < 10; i++) {
             rerender(<InteractiveMCQ exercise={exercise} colors={colors} />);
        }
        const endRerender = performance.now();
        console.log(`Average Re-render time (over 10 runs): ${((endRerender - startRerender)/10).toFixed(2)}ms`);

        expect(screen.getByText('Option 0')).toBeDefined();
    });
});
