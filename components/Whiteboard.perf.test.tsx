import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Whiteboard from './Whiteboard';
import { ActivityLoggerProvider } from '../ActivityContext';
import { ActivityLogger } from '../ActivityLogger';
import React from 'react';

const mockLogger = {
    startSession: vi.fn(),
    endSession: vi.fn(),
    startActivity: vi.fn(),
    endActivity: vi.fn(),
    logFocusItem: vi.fn(),
};

vi.mock('../ActivityLogger', () => {
    return {
        ActivityLogger: vi.fn(function() {
            return mockLogger;
        })
    };
});

describe('Whiteboard Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('studentId', 'test-student');
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('debounces zoom events (optimized)', () => {
        render(
            <ActivityLoggerProvider moduleId="test-module">
                <Whiteboard
                    blocks={[]}
                    onAddBlock={() => {}}
                    onUpdateBlock={() => {}}
                    onRemoveBlock={() => {}}
                    onFocusBlock={() => {}}
                    presentingBlockId={null}
                    onEnterPresentation={() => {}}
                    onExitPresentation={() => {}}
                    onNextSlide={() => {}}
                    onPrevSlide={() => {}}
                />
            </ActivityLoggerProvider>
        );

        const whiteboard = document.getElementById('whiteboard-main');
        if (!whiteboard) throw new Error('Whiteboard not found');

        // Simulate 10 wheel events rapidly
        act(() => {
            for (let i = 0; i < 10; i++) {
                fireEvent.wheel(whiteboard, { deltaY: 100 });
            }
        });

        const loggerInstance = vi.mocked(ActivityLogger).mock.results[0].value;

        // Immediately, there should be 0 zoom logs (because it's debounced)
        let zoomLogs = loggerInstance.logFocusItem.mock.calls.filter((call: any) => call[1] === 'Canvas Zoom');
        expect(zoomLogs.length).toBe(0);

        // Advance time by 500ms
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Now there should be exactly 1 log
        zoomLogs = loggerInstance.logFocusItem.mock.calls.filter((call: any) => call[1] === 'Canvas Zoom');
        expect(zoomLogs.length).toBe(1);
        console.log('Verified: 10 wheel events resulted in 1 debounced log call.');
    });

    it('handles rapid panning events without errors (stability)', () => {
        const { container } = render(
            <ActivityLoggerProvider moduleId="test-module">
                <Whiteboard
                    blocks={[]}
                    onAddBlock={() => {}}
                    onUpdateBlock={() => {}}
                    onRemoveBlock={() => {}}
                    onFocusBlock={() => {}}
                    presentingBlockId={null}
                    onEnterPresentation={() => {}}
                    onExitPresentation={() => {}}
                    onNextSlide={() => {}}
                    onPrevSlide={() => {}}
                />
            </ActivityLoggerProvider>
        );

        const main = container.querySelector('#whiteboard-main');
        if (!main) throw new Error('Whiteboard main not found');

        // Simulate Mouse Down (Start Pan)
        fireEvent.mouseDown(main, { clientX: 100, clientY: 100, button: 0 });

        // Simulate Rapid Mouse Move (Pan)
        act(() => {
            for (let i = 0; i < 50; i++) {
                fireEvent.mouseMove(main, { clientX: 100 + i, clientY: 100 + i });
            }
        });

        // Simulate Mouse Up (End Pan)
        fireEvent.mouseUp(main);

        // Advance timers for momentum
        act(() => {
            vi.advanceTimersByTime(100);
        });

        // Ensure no errors and component is still rendered
        expect(container.querySelector('#whiteboard-main')).toBeTruthy();
    });

    it('handles wheel events (zoom) correctly (stability)', () => {
        const { container } = render(
            <ActivityLoggerProvider moduleId="test-module">
                <Whiteboard
                    blocks={[]}
                    onAddBlock={() => {}}
                    onUpdateBlock={() => {}}
                    onRemoveBlock={() => {}}
                    onFocusBlock={() => {}}
                    presentingBlockId={null}
                    onEnterPresentation={() => {}}
                    onExitPresentation={() => {}}
                    onNextSlide={() => {}}
                    onPrevSlide={() => {}}
                />
            </ActivityLoggerProvider>
        );

        const main = container.querySelector('#whiteboard-main');
        if (!main) throw new Error('Whiteboard main not found');

        // Simulate Wheel
        fireEvent.wheel(main, { deltaY: -100 });

        // Advance timers if any
        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(container.querySelector('#whiteboard-main')).toBeTruthy();
    });
});
