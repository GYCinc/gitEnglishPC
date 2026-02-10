import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'react-dom';
import App from './App';
import React from 'react';

// Mock child components
vi.mock('./components/Sidebar', () => ({ default: () => <div /> }));
vi.mock('./components/Whiteboard', () => ({ default: () => <div /> }));
vi.mock('./components/GlobalSettings', () => ({ default: () => <div /> }));
vi.mock('./components/GamificationHUD', () => ({ default: () => <div /> }));

// Mock RadialMenu to expose a way to trigger state updates (difficulty)
vi.mock('./components/RadialMenu', () => ({
  default: ({ onCycleDifficulty }: any) => {
    return (
      <div data-testid="radial-menu">
        <button
            onClick={onCycleDifficulty}
            data-testid="cycle-difficulty"
        >
            Cycle Difficulty
        </button>
      </div>
    );
  }
}));

describe('App Performance', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'setItem');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('debounces localStorage updates for high-frequency state changes', () => {
    const { getByTestId } = render(<App />);
    const updateBtn = getByTestId('cycle-difficulty');

    const UPDATE_COUNT = 20;

    // Simulate rapid updates
    act(() => {
        for (let i = 0; i < UPDATE_COUNT; i++) {
            flushSync(() => {
                updateBtn.click();
            });
        }
    });

    const calls = vi.mocked(localStorage.setItem).mock.calls;
    const difficultyCallsBefore = calls.filter(call => call[0] === 'practiceGenie-difficulty');

    // Should be 0 because we haven't advanced timers yet
    expect(difficultyCallsBefore.length).toBe(0);

    // Advance timers to trigger debounce
    act(() => {
        vi.advanceTimersByTime(500);
    });

    const callsAfter = vi.mocked(localStorage.setItem).mock.calls;
    const difficultyCallsAfter = callsAfter.filter(call => call[0] === 'practiceGenie-difficulty');

    // Should be exactly 1 call now
    expect(difficultyCallsAfter.length).toBe(1);

    console.log(`Optimization Verified: ${difficultyCallsAfter.length} write for ${UPDATE_COUNT} updates.`);
  });
});
