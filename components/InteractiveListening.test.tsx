import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { InteractiveListening } from './InteractiveExercises';
import { IListeningSpecificInfoExercise } from '../types';

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

describe('InteractiveListening Component', () => {
    it('preserves input state when new questions are prepended (stable keys)', () => {
        const initialExercise: IListeningSpecificInfoExercise = {
            title: 'Test Exercise',
            audioText: 'Some audio text',
            questions: [
                { question: 'Question 1', answer: 'Answer 1' },
                { question: 'Question 2', answer: 'Answer 2' },
            ],
        };

        const colors = {
            chip: { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-200' },
            textOnLight: 'text-slate-900',
            border: 'border-slate-200',
        };

        const { rerender } = render(<InteractiveListening exercise={initialExercise} colors={colors} />);

        // Find inputs
        const inputs = screen.getAllByRole('textbox');
        // inputs[0] corresponds to Question 1
        const input1 = inputs[0] as HTMLInputElement;

        // Type into Question 1
        fireEvent.change(input1, { target: { value: 'User Answer 1' } });
        expect(input1.value).toBe('User Answer 1');

        // Update exercise by PREPENDING a new question
        const updatedExercise: IListeningSpecificInfoExercise = {
            ...initialExercise,
            questions: [
                { question: 'New Question 0', answer: 'Answer 0' },
                ...initialExercise.questions
            ],
        };

        rerender(<InteractiveListening exercise={updatedExercise} colors={colors} />);

        // After rerender, find the input for "Question 1" again.
        // The first input is now for "New Question 0"
        // The second input is for "Question 1"
        const newInputs = screen.getAllByRole('textbox');

        // Ensure we have 3 inputs
        expect(newInputs).toHaveLength(3);

        const inputForQ0 = newInputs[0] as HTMLInputElement;
        const inputForQ1 = newInputs[1] as HTMLInputElement;

        // This assertion checks for the CORRECT behavior.
        // It will fail if index keys are used.
        expect(inputForQ1.value).toBe('User Answer 1');
        expect(inputForQ0.value).toBe(''); // New input should be empty
    });
});
