import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Whiteboard from './Whiteboard';
import React from 'react';
import { useActivityLogger } from '../ActivityContext';

// Mock dependencies
vi.mock('../ActivityContext', () => ({
  useActivityLogger: vi.fn()
}));

vi.mock('./BlocksLayer', () => ({
  BlocksLayer: () => <div data-testid="blocks-layer" />
}));

vi.mock('./SnapLinesOverlay', () => ({
  SnapLinesOverlay: () => <div data-testid="snap-lines" />
}));

vi.mock('./icons', () => ({
    MagicWandIcon: () => <div data-testid="magic-wand" />
}));

describe('Whiteboard Performance', () => {
  const mockLogFocusItem = vi.fn();
  const mockLogger = {
    logFocusItem: mockLogFocusItem,
    endActivity: vi.fn(),
  };

  beforeEach(() => {
    (useActivityLogger as any).mockReturnValue({ logger: mockLogger });
    mockLogFocusItem.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throttles logging on zoom (wheel) events (leading edge)', () => {
    const props = {
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

    const { getByRole } = render(<Whiteboard {...props} />);

    let main;
    try {
        main = getByRole('main');
    } catch (e) {
        main = document.getElementById('whiteboard-main');
    }

    if (!main) throw new Error('Could not find main element');

    // Simulate 20 rapid wheel events
    for (let i = 0; i < 20; i++) {
        fireEvent.wheel(main, { deltaY: 100 });
    }

    // Expecting IMMEDIATE logging (Throttle leading edge)
    // This will FAIL on current code (which debounces trailing edge)
    expect(mockLogFocusItem).toHaveBeenCalledTimes(1);

    // Advance time by 1000ms
    act(() => {
        vi.advanceTimersByTime(1000);
    });

    // Should still be 1 (since no new events)
    // If it was debounced, it would become 1 here (so total calls would match, but timing differs)
    expect(mockLogFocusItem).toHaveBeenCalledTimes(1);
  });
});
