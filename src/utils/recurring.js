/**
 * Recurring Tasks Engine
 * Auto-resets tasks with #daily tag when the date changes
 * @module utils/recurring
 */

const LAST_RESET_KEY = 'commander-last-daily-reset';

/**
 * Get today's date as YYYY-MM-DD string
 * @returns {string}
 */
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if daily reset has already run today
 * @returns {boolean}
 */
export function hasResetToday() {
    try {
        const lastReset = localStorage.getItem(LAST_RESET_KEY);
        return lastReset === getTodayString();
    } catch (e) {
        console.warn('[Recurring] Failed to check reset status:', e);
        return true; // Assume already reset to prevent data loss
    }
}

/**
 * Mark today as reset
 */
function markResetDone() {
    try {
        localStorage.setItem(LAST_RESET_KEY, getTodayString());
    } catch (e) {
        console.warn('[Recurring] Failed to save reset status:', e);
    }
}

/**
 * Check if a task has the #daily tag
 * @param {Object} task 
 * @returns {boolean}
 */
function isDailyTask(task) {
    if (!task || !task.tags) return false;
    return task.tags.some(tag =>
        tag.toLowerCase().replace('#', '') === 'daily'
    );
}

/**
 * Reset all #daily tasks (uncheck/move back to shipToday)
 * Called on app startup when date has changed
 * @param {Object} state - Current app state
 * @param {Function} moveItemFn - Function to move items between sections
 * @returns {number} Number of tasks reset
 */
export function resetDailyTasks(state, moveItemFn) {
    if (hasResetToday()) {
        console.log('[Recurring] Daily reset already done today');
        return 0;
    }

    console.log('[Recurring] Running daily task reset...');
    let resetCount = 0;

    try {
        // Find all #daily tasks in "shipped" or completed state
        // and move them back to shipToday
        const sections = ['inbox', 'next', 'shipToday'];

        sections.forEach(section => {
            const items = state[section] || [];
            items.forEach(item => {
                if (isDailyTask(item) && item.completed) {
                    // Uncheck the task
                    item.completed = false;
                    resetCount++;
                }
            });
        });

        // Also check shipped items and recycle #daily ones
        if (state.shipped && Array.isArray(state.shipped)) {
            state.shipped.forEach(item => {
                if (isDailyTask(item)) {
                    // Move back to shipToday
                    if (moveItemFn) {
                        moveItemFn('shipped', 'shipToday', item.id);
                    }
                    resetCount++;
                }
            });
        }

        markResetDone();
        console.log(`[Recurring] Reset ${resetCount} daily tasks`);

    } catch (e) {
        console.error('[Recurring] Error during daily reset:', e);
    }

    return resetCount;
}

/**
 * Generate status report for Slack/Teams
 * @param {Object} state - Current app state
 * @returns {string} Formatted status report
 */
export function generateStatusReport(state) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    const shipped = (state.shipped || [])
        .slice(0, 10)
        .map(t => t.text || t)
        .filter(Boolean);

    const shipToday = (state.shipToday || [])
        .map(t => t.text)
        .filter(Boolean);

    const next = (state.next || [])
        .slice(0, 3)
        .map(t => t.text)
        .filter(Boolean);

    let report = `📅 *Status Report - ${today}*\n\n`;

    if (shipped.length > 0) {
        report += `✅ *Shipped:*\n`;
        shipped.forEach(t => report += `  • ${t}\n`);
        report += '\n';
    }

    if (shipToday.length > 0) {
        report += `🚀 *In Progress:*\n`;
        shipToday.forEach(t => report += `  • ${t}\n`);
        report += '\n';
    }

    if (next.length > 0) {
        report += `⏭️ *Up Next:*\n`;
        next.forEach(t => report += `  • ${t}\n`);
    }

    if (shipped.length === 0 && shipToday.length === 0) {
        report += `(No tasks logged yet today)`;
    }

    return report.trim();
}

/**
 * Copy status report to clipboard
 * @param {Object} state 
 * @returns {Promise<boolean>} Success status
 */
export async function copyStatusReport(state) {
    try {
        const report = generateStatusReport(state);
        await navigator.clipboard.writeText(report);
        return true;
    } catch (e) {
        console.error('[Recurring] Failed to copy status report:', e);
        return false;
    }
}

/**
 * Check storage quota and warn if approaching limit
 * @returns {{ used: number, quota: number, percentage: number, warning: boolean }}
 */
export async function checkStorageQuota() {
    const result = { used: 0, quota: 0, percentage: 0, warning: false };

    try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            result.used = estimate.usage || 0;
            result.quota = estimate.quota || 0;
            result.percentage = result.quota > 0
                ? Math.round((result.used / result.quota) * 100)
                : 0;
            result.warning = result.used > 4 * 1024 * 1024; // 4MB warning threshold
        } else {
            // Fallback: estimate localStorage size
            let totalSize = 0;
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length * 2; // UTF-16
                }
            }
            result.used = totalSize;
            result.quota = 5 * 1024 * 1024; // Assume 5MB limit
            result.percentage = Math.round((totalSize / result.quota) * 100);
            result.warning = totalSize > 4 * 1024 * 1024;
        }
    } catch (e) {
        console.warn('[Recurring] Failed to check storage quota:', e);
    }

    return result;
}
