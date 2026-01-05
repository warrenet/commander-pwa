/**
 * Streak Tracker (BONUS-04)
 * Tracks consecutive days with empty inbox at EOD
 * @module utils/streak
 */

const STREAK_KEY = 'commander-inbox-zero-streak';
const LAST_CHECK_KEY = 'commander-streak-last-check';

/**
 * Get current streak data
 * @returns {{ count: number, lastDate: string | null }}
 */
export function getStreak() {
    const stored = localStorage.getItem(STREAK_KEY);
    if (!stored) {
        return { count: 0, lastDate: null };
    }
    try {
        return JSON.parse(stored);
    } catch {
        return { count: 0, lastDate: null };
    }
}

/**
 * Check inbox and update streak
 * @param {Array} inbox - Current inbox items
 * @returns {{ count: number, isNewRecord: boolean, justCleared: boolean }}
 */
export function checkStreak(inbox) {
    const today = new Date().toISOString().split('T')[0];
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    const streak = getStreak();

    // Only check once per day
    if (lastCheck === today) {
        return { count: streak.count, isNewRecord: false, justCleared: false };
    }

    // Check if inbox is empty
    if (inbox.length === 0) {
        const isConsecutive = isYesterday(streak.lastDate);
        const newCount = isConsecutive ? streak.count + 1 : 1;
        const isNewRecord = newCount > streak.count;

        // Update streak
        localStorage.setItem(STREAK_KEY, JSON.stringify({
            count: newCount,
            lastDate: today
        }));
        localStorage.setItem(LAST_CHECK_KEY, today);

        return { count: newCount, isNewRecord, justCleared: true };
    }

    // Inbox not empty - streak broken if today wasn't already logged
    if (streak.lastDate !== today) {
        localStorage.setItem(LAST_CHECK_KEY, today);
        // Don't reset streak yet - they have until EOD
    }

    return { count: streak.count, isNewRecord: false, justCleared: false };
}

/**
 * Check if a date string is yesterday
 * @param {string | null} dateStr
 * @returns {boolean}
 */
function isYesterday(dateStr) {
    if (!dateStr) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0] === dateStr;
}

/**
 * Get streak display message
 * @param {number} count
 * @returns {string}
 */
export function getStreakMessage(count) {
    if (count === 0) return '';
    if (count === 1) return '🎯 First Inbox Zero!';
    if (count < 5) return `🔥 ${count}-day streak!`;
    if (count < 10) return `🔥🔥 ${count}-day streak!`;
    if (count < 30) return `🔥🔥🔥 ${count}-day streak!`;
    return `🏆 ${count}-DAY LEGEND!`;
}

/**
 * Reset streak (for testing)
 */
export function resetStreak() {
    localStorage.removeItem(STREAK_KEY);
    localStorage.removeItem(LAST_CHECK_KEY);
}

export default {
    getStreak,
    checkStreak,
    getStreakMessage,
    resetStreak
};
