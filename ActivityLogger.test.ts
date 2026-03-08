import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityLogger } from './ActivityLogger';

describe('ActivityLogger', () => {
    let logger: ActivityLogger;

    beforeEach(() => {
        logger = new ActivityLogger('test-module', 'test-student');
        logger.startSession();
    });

    it('should log stream events correctly', () => {
        logger.startActivity('act-1', 'drill', 'Test Activity');

        // Log a batch of events
        for (let i = 0; i < 100; i++) {
            logger.logStreamEvent('test-event', { index: i });
        }

        logger.endActivity();
        const session = logger.endSession();
        const activity = session.activities.find(a => a.activity_id === 'act-1');

        expect(activity).toBeDefined();
        if (activity) {
            expect(activity.stream_data.length).toBe(100);
            expect(activity.stream_data[0].data.index).toBe(0);
            expect(activity.stream_data[99].data.index).toBe(99);
        }
    });

    it('should handle large number of stream events', () => {
        logger.startActivity('act-2', 'drill', 'Large Activity');

        // Log a large batch of events
        for (let i = 0; i < 600; i++) {
            logger.logStreamEvent('test-event', { index: i });
        }

        logger.endActivity();
        const session = logger.endSession();
        const activity = session.activities.find(a => a.activity_id === 'act-2');

        expect(activity).toBeDefined();
        if (activity) {
            expect(activity.stream_data.length).toBe(600);
            expect(activity.stream_data[0].data.index).toBe(0);
            expect(activity.stream_data[599].data.index).toBe(599);
        }
    });
});
