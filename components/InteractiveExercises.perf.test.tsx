import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { InteractiveClozeOrDialogue } from './InteractiveExercises';
import { IClozeParagraphExercise } from '../types';

// Mock dependencies
vi.mock('../GamificationContext', () => ({
  useGamification: () => ({
    addXP: vi.fn(),
    checkStreak: vi.fn(),
  }),
}));

vi.mock('../services/mistralService', () => ({
  checkAnswerWithAI: vi.fn().mockResolvedValue(JSON.stringify({ isCorrect: true, feedback: 'Good job!' })),
}));

// Mock Confetti to avoid canvas issues
vi.mock('./Confetti', () => ({
  default: () => <div data-testid="confetti" />,
}));

describe('InteractiveClozeOrDialogue Performance', () => {
  const mockExercise: IClozeParagraphExercise = {
    paragraph: "This is a test paragraph.\nIt has multiple lines.\nAnd a [BLANK] here.\nAnd another line.",
    answers: ["blank"],
    wordBank: ["blank", "filled", "empty"],
  };

  const mockColors = {
    textOnLight: 'text-slate-900',
    chip: {
      bg: 'bg-white',
      border: 'border-slate-200',
      text: 'text-slate-700',
    },
    border: 'border-blue-500',
  };

  let splitSpy: any;

  beforeEach(() => {
    // Spy on String.prototype.split
    splitSpy = vi.spyOn(String.prototype, 'split');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('avoids splitting strings on re-renders (optimized)', async () => {
    render(<InteractiveClozeOrDialogue exercise={mockExercise} colors={mockColors} />);

    // Reset spy to only count updates
    splitSpy.mockClear();

    // Trigger a state update by changing the select value
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: 'blank' } });

    // The component re-renders.
    // In optimized version, it should NOT split again because props didn't change.

    // Just count total calls on the specific strings we know
    const callsOnText = splitSpy.mock.instances.filter((instance: String) =>
        instance.toString().includes('This is a test paragraph') ||
        instance.toString().includes('And a ')
    ).length;

    // We expect NO re-splitting behavior
    expect(callsOnText).toBe(0);
    console.log(`Optimized split calls on text during update: ${callsOnText}`);
  });
});
