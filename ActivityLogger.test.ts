import { describe, it, expect, vi } from 'vitest';
import { ActivityLogger } from './ActivityLogger';

describe('ActivityLogger', () => {
  it('should auto-start an activity if logFocusItem is called without an active activity', () => {
    const logger = new ActivityLogger('test-module', 'student-1');
    logger.startSession();

    // Ensure no activity is started explicitly
    // logger.startActivity(...) - intentionally skipped

    // Log a focus item
    logger.logFocusItem('Grammar', 'Test Concept', 10);

    // End session to get the payload
    const payload = logger.endSession();

    // Check if an activity was created
    expect(payload.activities.length).toBeGreaterThan(0);

    // Check if the focus item is inside the activity
    const activity = payload.activities.find(a => a.activity_name === 'General Interaction');
    expect(activity).toBeDefined();
    expect(activity?.activity_type).toBe('ui_event');
    expect(activity?.focus_items.length).toBe(1);
    expect(activity?.focus_items[0].concept).toBe('Test Concept');
  });
});
