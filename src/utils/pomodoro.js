/**
 * Pomodoro Timer (BONUS Feature)
 * 25-minute focus sessions with auto-logging
 * @module utils/pomodoro
 */

import { haptic } from './haptics.js';

const POMODORO_KEY = 'commander-pomodoro-sessions';

let currentSession = null;
let timerInterval = null;

/**
 * Start a Pomodoro session
 * @param {Object} options
 * @param {string} [options.task] - Task being worked on
 * @param {number} [options.duration] - Duration in minutes (default: 25)
 * @param {Function} [options.onTick] - Callback each second with remaining time
 * @param {Function} [options.onComplete] - Callback when session completes
 * @returns {Object} Session info
 */
export function startPomodoro(options = {}) {
    if (currentSession) {
        console.warn('Pomodoro already in progress');
        return currentSession;
    }

    const duration = options.duration || 25;
    const startTime = Date.now();
    const endTime = startTime + (duration * 60 * 1000);

    currentSession = {
        id: startTime.toString(36),
        task: options.task || 'Focus time',
        startTime,
        endTime,
        duration
    };

    // Start timer
    timerInterval = setInterval(() => {
        const remaining = Math.max(0, endTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        if (options.onTick) {
            options.onTick({ minutes, seconds, remaining });
        }

        if (remaining <= 0) {
            completePomodoro(options.onComplete);
        }
    }, 1000);

    haptic('medium');
    return currentSession;
}

/**
 * Complete the current Pomodoro
 * @param {Function} [callback]
 */
function completePomodoro(callback) {
    if (!currentSession) return;

    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Log completed session
    const sessions = getCompletedSessions();
    sessions.push({
        ...currentSession,
        completedAt: Date.now()
    });
    localStorage.setItem(POMODORO_KEY, JSON.stringify(sessions.slice(-100))); // Keep last 100

    // Haptic feedback
    haptic('success');

    const completed = { ...currentSession };
    currentSession = null;

    if (callback) {
        callback(completed);
    }
}

/**
 * Cancel current Pomodoro
 */
export function cancelPomodoro() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    currentSession = null;
    haptic('warning');
}

/**
 * Get current session info
 * @returns {Object|null}
 */
export function getCurrentSession() {
    return currentSession;
}

/**
 * Check if Pomodoro is running
 * @returns {boolean}
 */
export function isRunning() {
    return currentSession !== null;
}

/**
 * Get completed sessions
 * @returns {Array}
 */
export function getCompletedSessions() {
    try {
        return JSON.parse(localStorage.getItem(POMODORO_KEY) || '[]');
    } catch {
        return [];
    }
}

/**
 * Get today's Pomodoro count
 * @returns {number}
 */
export function getTodayCount() {
    const today = new Date().toISOString().split('T')[0];
    return getCompletedSessions().filter(s => {
        const sessionDate = new Date(s.completedAt).toISOString().split('T')[0];
        return sessionDate === today;
    }).length;
}

/**
 * Get total focus time today (in minutes)
 * @returns {number}
 */
export function getTodayMinutes() {
    const today = new Date().toISOString().split('T')[0];
    return getCompletedSessions()
        .filter(s => {
            const sessionDate = new Date(s.completedAt).toISOString().split('T')[0];
            return sessionDate === today;
        })
        .reduce((total, s) => total + s.duration, 0);
}

export default {
    startPomodoro,
    cancelPomodoro,
    getCurrentSession,
    isRunning,
    getCompletedSessions,
    getTodayCount,
    getTodayMinutes
};
