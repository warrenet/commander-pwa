/**
 * Haptic Feedback Utility (UX-01)
 * Provides tactile feedback on mobile devices
 * @module utils/haptics
 */

/**
 * Trigger haptic feedback
 * @param {'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'} type
 */
export function haptic(type = 'light') {
    if (!navigator.vibrate) return;

    const patterns = {
        light: 5,
        medium: 10,
        heavy: 20,
        success: [10, 50, 10],
        warning: [20, 30, 20],
        error: [50, 100, 50]
    };

    const pattern = patterns[type] || patterns.light;
    navigator.vibrate(pattern);
}

/**
 * Quick tap feedback
 */
export function tap() {
    haptic('light');
}

/**
 * Success feedback
 */
export function success() {
    haptic('success');
}

/**
 * Error feedback
 */
export function error() {
    haptic('error');
}

export default {
    haptic,
    tap,
    success,
    error
};
