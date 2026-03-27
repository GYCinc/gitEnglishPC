import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InteractiveRegisterSort } from './InteractiveExercises';
import React from 'react';

const mockColors = {
    textOnLight: 'text-gray-900',
    border: 'border-gray-200',
    textMuted: 'text-gray-500',
    bg: 'bg-white',
    bgLight: 'bg-gray-50',
    chip: {
        bg: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        hoverBg: 'hover:bg-gray-50'
    }
};

const mockExercise = {
    id: "ex1",
    type: "register_sort" as any,
    title: "Sort the phrases",
    explanation: "test",
    phrases: ["Formal 1", "Informal 1"],
    categories: ["Formal", "Informal"]
};

describe('InteractiveRegisterSort Performance Benchmark', () => {
    it('benchmarks handleDrop when moving an already-classified item', () => {
        // We'll run the drop operation 1000 times to measure the time taken.
        render(<InteractiveRegisterSort exercise={mockExercise} colors={mockColors} />);

        // Setup mock event
        const mockDropEvent = {
            preventDefault: vi.fn(),
            dataTransfer: {
                getData: vi.fn().mockReturnValue('Formal 1')
            }
        };

        const formalCategoryElement = screen.getByText('Formal').closest('div') as HTMLElement;
        const informalCategoryElement = screen.getByText('Informal').closest('div') as HTMLElement;

        // Initial drop into Formal
        fireEvent.drop(formalCategoryElement, mockDropEvent);

        // Now it's classified. We will benchmark moving it between classified categories.
        const start = performance.now();
        for (let i = 0; i < 5000; i++) {
            fireEvent.drop(i % 2 === 0 ? informalCategoryElement : formalCategoryElement, mockDropEvent);
        }
        const end = performance.now();

        console.log(`Time taken for 5000 drops (classified -> classified): ${(end - start).toFixed(2)} ms`);
    });
});
