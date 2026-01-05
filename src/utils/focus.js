/**
 * Focus Mode (BONUS Feature)
 * Minimalist view showing only Ship Today + timer
 * @module utils/focus
 */

let focusModeActive = false;
let focusTimer = null;
let focusStartTime = null;

/**
 * Check if focus mode is active
 * @returns {boolean}
 */
export function isFocusModeActive() {
    return focusModeActive;
}

/**
 * Enter focus mode
 * @param {Object} options
 * @param {number} [options.duration] - Focus duration in minutes (default: 25)
 * @param {Function} [options.onComplete] - Callback when timer completes
 */
export function enterFocusMode(options = {}) {
    const duration = options.duration || 25;
    focusModeActive = true;
    focusStartTime = Date.now();

    // Add focus mode class to body
    document.body.classList.add('focus-mode');

    // Start timer if duration specified
    if (duration > 0) {
        focusTimer = setTimeout(() => {
            exitFocusMode();
            if (options.onComplete) {
                options.onComplete();
            }
        }, duration * 60 * 1000);
    }

    return {
        startTime: focusStartTime,
        duration: duration
    };
}

/**
 * Exit focus mode
 */
export function exitFocusMode() {
    focusModeActive = false;
    focusStartTime = null;

    if (focusTimer) {
        clearTimeout(focusTimer);
        focusTimer = null;
    }

    document.body.classList.remove('focus-mode');
}

/**
 * Get remaining focus time
 * @returns {{ minutes: number, seconds: number } | null}
 */
export function getFocusTimeRemaining() {
    if (!focusStartTime || !focusTimer) return null;

    const elapsed = Date.now() - focusStartTime;
    const remaining = Math.max(0, (25 * 60 * 1000) - elapsed);

    return {
        minutes: Math.floor(remaining / 60000),
        seconds: Math.floor((remaining % 60000) / 1000)
    };
}

/**
 * Toggle focus mode
 * @param {Object} options
 * @returns {boolean} New state
 */
export function toggleFocusMode(options = {}) {
    if (focusModeActive) {
        exitFocusMode();
    } else {
        enterFocusMode(options);
    }
    return focusModeActive;
}

export default {
    isFocusModeActive,
    enterFocusMode,
    exitFocusMode,
    getFocusTimeRemaining,
    toggleFocusMode
};
