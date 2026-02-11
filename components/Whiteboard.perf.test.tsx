import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Whiteboard from './Whiteboard';
import React from 'react';
import { ExerciseType } from '../enums';
import { useActivityLogger } from '../ActivityContext';

// Mock dependencies
vi.mock('../ActivityContext', () => ({
  useActivityLogger: vi.fn(),
}));

// Mock child components that are not the focus
vi.mock('./BlocksLayer', () => ({ BlocksLayer: () => <div data-testid="blocks-layer" /> }));
vi.mock('./SnapLinesOverlay', () => ({ SnapLinesOverlay: () => <div data-testid="snap-lines" /> }));

describe('Whiteboard Performance - Zoom Logging', () => {
  let mockLogFocusItem: any;

  beforeEach(() => {
    mockLogFocusItem = vi.fn();
    vi.mocked(useActivityLogger).mockReturnValue({
      logger: {
        logFocusItem: mockLogFocusItem,
        startActivity: vi.fn(),
        endActivity: vi.fn(),
      }
    } as any);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const defaultProps = {
    blocks: [],
    onAddBlock: vi.fn(),
    onUpdateBlock: vi.fn(),
    onRemoveBlock: vi.fn(),
    onFocusBlock: vi.fn(),
    presentingBlockId: null,
    onEnterPresentation: vi.fn(),
    onExitPresentation: vi.fn(),
    onNextSlide: vi.fn(),
    onPrevSlide: vi.fn(),
  };

  it('should not log synchronously on every wheel event (debounce check)', () => {
    const { container } = render(<Whiteboard {...defaultProps} />);
    const mainDiv = container.querySelector('#whiteboard-main');

    if (!mainDiv) throw new Error('Whiteboard main div not found');

    const WHEEL_EVENTS_COUNT = 20;

    // Simulate rapid zooming
    act(() => {
      for (let i = 0; i < WHEEL_EVENTS_COUNT; i++) {
        fireEvent.wheel(mainDiv, { deltaY: -100 });
      }
    });

    const callsImmediately = mockLogFocusItem.mock.calls.filter((call: any[]) => call[1] === 'Canvas Zoom');

    // In optimized code, this should be 0.
    // In unoptimized code (baseline), this will be WHEEL_EVENTS_COUNT.
    expect(callsImmediately.length).toBe(0);

    // Advance timers to trigger the debounced log
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const callsTotal = mockLogFocusItem.mock.calls.filter((call: any[]) => call[1] === 'Canvas Zoom');

    // Should be exactly 1 call total after debounce
    expect(callsTotal.length).toBe(1);
  });
});
