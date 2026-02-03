import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'react-dom';
import App from './App';
import React from 'react';

// Mock child components
vi.mock('./components/Sidebar', () => ({
  default: ({ setInclusionRate, setFocusVocabulary, setFocusGrammar, setGrammarInclusionRate, onAddExercise }: any) => {
    return (
      <div data-testid="sidebar">
        <button
            onClick={() => setInclusionRate((prev: number) => prev + 1)}
            data-testid="update-inclusion-rate"
        >
            Update Inclusion Rate
        </button>
      </div>
    );
  }
}));

vi.mock('./components/Whiteboard', () => ({ default: () => <div /> }));
vi.mock('./components/RadialMenu', () => ({ default: () => <div /> }));
vi.mock('./components/GlobalSettings', () => ({ default: () => <div /> }));
vi.mock('./components/GamificationHUD', () => ({ default: () => <div /> }));

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
    const updateBtn = getByTestId('update-inclusion-rate');

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
    const inclusionRateCallsBefore = calls.filter(call => call[0] === 'practiceGenie-inclusionRate');

    // Should be 0 because we haven't advanced timers yet
    expect(inclusionRateCallsBefore.length).toBe(0);

    // Advance timers to trigger debounce
    act(() => {
        vi.advanceTimersByTime(500);
    });

    const callsAfter = vi.mocked(localStorage.setItem).mock.calls;
    const inclusionRateCallsAfter = callsAfter.filter(call => call[0] === 'practiceGenie-inclusionRate');

    // Should be exactly 1 call now
    expect(inclusionRateCallsAfter.length).toBe(1);

    console.log(`Optimization Verified: ${inclusionRateCallsAfter.length} write for ${UPDATE_COUNT} updates.`);
  });
});
