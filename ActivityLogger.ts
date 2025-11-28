import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is available via module import or global polyfill

/**
 * ActivityLogger.ts
 * =================
 * A reference implementation for logging student activity in external web modules.
 * This class ensures your data matches the Semantic Surfer Data Specification.
 *
 * Usage:
 *   const logger = new ActivityLogger('my-workbook-app', 'student_123');
 *   logger.startSession();
 *
 *   // ... user starts an exercise ...
 *   logger.startActivity('ex_001', 'quiz', 'Past Perfect Quiz');
 *
 *   // ... user interacts ...
 *   logger.logFocusItem('Grammar', 'Past Perfect', 45.5, 1.0);
 *
 *   // ... user finishes exercise ...
 *   logger.endActivity();
 *
 *   // ... end of session ...
 *   const payload = logger.endSession();
 *   console.log(JSON.stringify(payload));
 */

// Define explicit types for validation
export type ActivityType = 'consciousness_raising' | 'drill' | 'quiz' | 'reading' | 'writing' | 'presentation' | 'interaction' | 'config_change' | 'project_action' | 'ui_event' | 'navigation';
export type FocusCategory = 'Grammar' | 'Vocabulary' | 'Pronunciation' | 'Fluency' | 'Coherence' | 'Interaction' | 'Listening' | 'Task Achievement' | 'General UI' | 'Settings' | 'Project Management' | 'Movement';

export interface FocusItem {
  category: FocusCategory;
  concept: string; // Specific topic (e.g., "Third Conditional", "Phrasal Verbs", "Pan", "Zoom")
  time_spent_seconds: number;
  performance_score: number | null; // 0.0 to 1.0
  attempts: number;
  errors: string[];
  content_text: string | null; // Optional: The specific sentence/word practiced or UI state
}

export interface Activity {
  activity_id: string; // Unique ID for this exercise instance or UI flow
  activity_type: ActivityType;
  activity_name: string; // Human readable name
  duration_seconds: number;
  focus_items: FocusItem[];
  metadata: { [key: string]: any }; // Additional data
}

export interface SessionPayload {
  module_id: string;
  student_id: string;
  session_id: string;
  timestamp_start: string | null;
  timestamp_end: string | null;
  activities: Activity[];
}

export class ActivityLogger {
  private moduleId: string;
  private studentId: string;
  private sessionId: string;
  private timestampStart: string | null;
  private timestampEnd: string | null;
  private activities: Activity[];
  private currentActivity: (Omit<Activity, 'duration_seconds'> & { start_time: number }) | null;

  constructor(moduleId: string, studentId: string) {
    this.moduleId = moduleId;
    this.studentId = studentId;
    this.sessionId = uuidv4(); // Generate UUID for session ID
    this.timestampStart = null;
    this.timestampEnd = null;
    this.activities = [];
    this.currentActivity = null;
  }

  /**
   * Start the tracking session.
   */
  startSession(): void {
    this.timestampStart = new Date().toISOString();
    console.log(`[ActivityLogger] Session started: ${this.sessionId}`);
    this.startActivity('session_start_event', 'navigation', 'App Session Start');
    this.logFocusItem('General UI', 'App Loaded', 0);
    this.endActivity();
  }

  /**
   * Start a specific activity (exercise, drill, etc).
   * Automatically ends any previous activity if still active.
   * @param {string} activityId - Unique ID for this activity instance
   * @param {ActivityType} type - Category of the activity
   * @param {string} name - Human readable name
   */
  startActivity(activityId: string, type: ActivityType, name: string): void {
    if (this.currentActivity) {
      console.warn(
        "[ActivityLogger] Previous activity was not ended. Ending it now.",
      );
      this.endActivity();
    }

    this.currentActivity = {
      activity_id: activityId,
      activity_type: type,
      activity_name: name,
      start_time: performance.now(), // High precision timer
      focus_items: [],
      metadata: {  }, // Initialize metadata
    };
    console.log(`[ActivityLogger] Activity started: ${name} (${activityId})`);
  }

  /**
   * Log time spent on a specific concept or UI interaction within the current activity.
   * @param {FocusCategory} category - Grammar, Vocabulary, General UI, etc.
   * @param {string} concept - Specific topic (e.g., "Past Perfect", "Pan", "Settings Open")
   * @param {number} timeSpentSeconds - Time in seconds (can be 0 for instantaneous events)
   * @param {number|null} score - 0.0 to 1.0 (optional, e.g., for quiz performance)
   * @param {number} attempts - Number of tries (optional)
   * @param {string[]} errors - List of specific errors (optional)
   * @param {string} contentText - The actual text involved (optional, e.g., question text, user input)
   */
  logFocusItem(
    category: FocusCategory,
    concept: string,
    timeSpentSeconds: number,
    score: number | null = null,
    attempts: number = 1,
    errors: string[] = [],
    contentText: string | null = null,
  ): void {
    if (!this.currentActivity) {
      console.error(
        "[ActivityLogger] No active activity. Call startActivity() first.",
      );
      return;
    }

    this.currentActivity.focus_items.push({
      category: category,
      concept: concept,
      time_spent_seconds: timeSpentSeconds,
      performance_score: score,
      attempts: attempts,
      errors: errors,
      content_text: contentText,
    });
    console.log(`[ActivityLogger] Logged focus item: ${category} - ${concept}`);
  }

  /**
   * Add metadata to the current activity.
   * @param {string} key
   * @param {any} value
   */
  addMetadata(key: string, value: any): void {
    if (!this.currentActivity) {
      return;
    }
    this.currentActivity.metadata[key] = value;
  }

  /**
   * End the current activity and save it to the list.
   */
  endActivity(): void {
    if (!this.currentActivity) return;

    const duration =
      (performance.now() - this.currentActivity.start_time) / 1000;

    // Construct the final activity object
    const activity: Activity = {
      activity_id: this.currentActivity.activity_id,
      activity_type: this.currentActivity.activity_type,
      activity_name: this.currentActivity.activity_name,
      duration_seconds: parseFloat(duration.toFixed(2)),
      focus_items: this.currentActivity.focus_items,
      metadata: this.currentActivity.metadata,
    };

    this.activities.push(activity);
    console.log(`[ActivityLogger] Activity ended: ${activity.activity_name}`);
    this.currentActivity = null;
  }

  /**
   * End the session and return the full JSON payload.
   * Automatically ends any active activity.
   * @returns {SessionPayload} The valid JSON payload
   */
  endSession(): SessionPayload {
    if (this.currentActivity) {
      this.endActivity();
    }
    this.timestampEnd = new Date().toISOString();
    console.log(`[ActivityLogger] Session ended.`);

    return {
      module_id: this.moduleId,
      student_id: this.studentId,
      session_id: this.sessionId,
      timestamp_start: this.timestampStart,
      timestamp_end: this.timestampEnd,
      activities: this.activities,
    };
  }

  /**
   * Helper to download the JSON log as a file.
   */
  downloadLog(): void {
    const data = this.endSession();
    const filename = `activity_${this.moduleId}_${this.studentId}_${Date.now()}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`[ActivityLogger] Log downloaded as ${filename}`);
  }
}
