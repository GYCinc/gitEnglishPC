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

describe('Whiteboard Performance & Functionality', () => {
  let mockLogFocusItem: any;
  let mockLogger: any;

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

  beforeEach(() => {
    mockLogFocusItem = vi.fn();
    mockLogger = {
      logFocusItem: mockLogFocusItem,
      endActivity: vi.fn(),
    };
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

    const callsImmediately = mockLogFocusItem.mock.calls.filter((call: any[]) => call[1] === 'Canvas Zoom');

    // In optimized code, this should be 0.
    expect(callsImmediately.length).toBe(0);

    // Advance timers to trigger the debounced log
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const callsTotal = mockLogFocusItem.mock.calls.filter((call: any[]) => call[1] === 'Canvas Zoom');

    // Should be exactly 1 call total after debounce
    expect(callsTotal.length).toBe(1);
  });

  it('should still support panning after refactor (using refs)', () => {
    const { container } = render(<Whiteboard {...defaultProps} />);
    const mainDiv = container.querySelector('#whiteboard-main');
    const contentDiv = container.querySelector('#whiteboard-content');

    if (!mainDiv || !contentDiv) throw new Error('Whiteboard elements not found');

    // Trigger MouseDown (Start Pan)
    fireEvent.mouseDown(mainDiv, { clientX: 100, clientY: 100, button: 0, target: mainDiv });

    // Verify panning state (via class if possible, or just behavior)
    expect(mainDiv.className).toContain('cursor-grabbing');

    // Trigger MouseMove (Pan)
    act(() => {
        fireEvent.mouseMove(mainDiv, { clientX: 150, clientY: 150 }); // moved 50px
    });

    // Note: The implementation updates style directly on ref.current
    expect(contentDiv.getAttribute('style')).toContain('translate(50px, 50px)');

    // Trigger MouseUp (Stop Pan)
    fireEvent.mouseUp(mainDiv);

    expect(mainDiv.className).not.toContain('cursor-grabbing');
  });

  it('should still support zooming after refactor (using scaleRef)', () => {
    const { container } = render(<Whiteboard {...defaultProps} />);
    const mainDiv = container.querySelector('#whiteboard-main');
    const contentDiv = container.querySelector('#whiteboard-content');

    if (!mainDiv || !contentDiv) throw new Error('Whiteboard elements not found');

    // Trigger Wheel
    act(() => {
        fireEvent.wheel(mainDiv, { deltaY: -100, clientX: 500, clientY: 500 });
    });

    // deltaY -100 -> zoomFactor = exp(100 * 0.001) = exp(0.1) ≈ 1.105
    // newScale ≈ 1.105

    // Check transform
    const style = contentDiv.getAttribute('style');
    expect(style).toMatch(/scale\(1\.1/);
  });
});