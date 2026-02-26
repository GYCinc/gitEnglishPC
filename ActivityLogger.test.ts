import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityLogger } from './ActivityLogger';

describe('ActivityLogger', () => {
    let logger: ActivityLogger;

    beforeEach(() => {
        logger = new ActivityLogger('test-module', 'test-student');
        logger.startSession();
    });

    it('should log stream events correctly within buffer limit', () => {
        logger.startActivity('act-1', 'drill', 'Test Activity');

        // Log less than BUFFER_LIMIT (500)
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

    it('should handle large number of events exceeding buffer', () => {
        logger.startActivity('act-2', 'drill', 'Large Activity');

        // Log more than BUFFER_LIMIT (500)
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
