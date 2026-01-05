/**
 * Smart Tips & Suggestions System
 * Contextual, time-based, and action-based tips
 * @module utils/tips
 */

/**
 * Comprehensive tips library
 */
export const TIPS = {
    // Getting Started
    onboarding: [
        '👋 Welcome! Start by adding 3 tasks to your Inbox.',
        '💡 Use the Capture tab for quick task entry.',
        '⚡ The Quartermaster button changes based on time of day!',
        '🎯 Keep Ship Today to 3-5 items max for focus.'
    ],

    // Task Management
    tasks: [
        '📥 Inbox is for capture. Don\'t organize here—just dump!',
        '📋 Move to Next when you know you\'ll do it this week.',
        '🚀 Ship Today is sacred. Only what MUST happen today.',
        '✂️ Big task? Use AI: Break Down to split it into steps.',
        '🏷️ Tasks are auto-tagged based on keywords (buy → #errand).',
        '⏱️ Stuck on a task for days? It might need breaking down.',
        '🔄 Sunrise Protocol auto-moves stale Ship Today items back.'
    ],

    // Productivity
    productivity: [
        '🔒 Use Focus Mode to hide everything except Ship Today.',
        '🍅 Start a Pomodoro for 25 minutes of deep work.',
        '⌨️ Press ? to see keyboard shortcuts. j/k to navigate!',
        '🔥 Clear your Inbox daily to maintain your streak.',
        '🎯 Review Next every morning, pick 3 for Ship Today.',
        '🌙 End each day with Nightly Delta for reflection.',
        '🗓️ Sunday evening: do your Weekly Review.'
    ],

    // AI & Automation
    ai: [
        '🤖 AI prompts copy to clipboard—paste in free ChatGPT!',
        '🎯 Use AI: Prioritize when you have too many tasks.',
        '📅 AI: Plan Day creates a time-blocked schedule for you.',
        '🧠 Daily Debrief sends your logs to AI for analysis.',
        '🔗 AI can send tasks back via batch deep links.',
        '💡 No API keys needed—just use any free AI chat!'
    ],

    // MacroDroid
    automation: [
        '📱 Set MacroDroid to open Commander at 7AM for planning.',
        '🌙 9PM trigger can auto-open Nightly Delta template.',
        '📍 Location trigger: arrive at work → show Ship Today.',
        '🎤 "OK Google, task" can send to Commander via deep link.',
        '⚡ Quartermaster knows if it\'s morning, day, or night.'
    ],

    // Time-based suggestions
    morning: [
        '☀️ Good morning! Review your Ship Today list.',
        '🎯 Pick your top 3 priorities for today.',
        '📋 Use Mission Control template to plan your day.',
        '☕ Start with your hardest task (eat that frog!).'
    ],

    afternoon: [
        '⏰ Midday check: How is Ship Today going?',
        '🍅 Feeling stuck? Try a Pomodoro session.',
        '📥 Process Inbox before end of day.',
        '🎯 Re-prioritize if needed—it\'s okay to adjust.'
    ],

    evening: [
        '🌙 Time to wind down. Open Nightly Delta.',
        '✅ Mark completed items as shipped.',
        '🔄 Move unfinished Ship Today items back to Next.',
        '📝 Capture any lingering thoughts before tomorrow.'
    ],

    weekend: [
        '🗓️ Perfect time for Weekly Review!',
        '🧹 Clean up stale items in your Inbox.',
        '🎯 Set intentions for next week.',
        '📊 Review your Shipped items—celebrate wins!'
    ],

    // Action-based tips (after completing actions)
    afterShip: [
        '🚀 Great job shipping! Keep the momentum.',
        '✅ That\'s one less thing on your plate!',
        '🎉 Shipped! What\'s next?'
    ],

    afterCapture: [
        '📥 Captured! Remember to process your Inbox later.',
        '✏️ Got it! Move to Next when ready.',
        '💡 Nice capture! Auto-tagged if keywords matched.'
    ],

    afterInboxZero: [
        '🎉 INBOX ZERO! You\'re a productivity legend!',
        '🔥 Inbox cleared! Your streak grows.',
        '✨ Empty inbox = clear mind. Well done!'
    ],

    // Motivational
    motivation: [
        '💪 You\'ve got this. One task at a time.',
        '🎯 Focus on progress, not perfection.',
        '🚀 Ship fast, ship often.',
        '⭐ Small wins lead to big victories.',
        '🔥 Consistency beats intensity.',
        '🧠 Your future self will thank you.',
        '✨ Every shipped task is a win.'
    ]
};

/**
 * Get time-appropriate tips
 * @returns {string[]}
 */
export function getTimeTips() {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    if (day === 0 || day === 6) {
        return TIPS.weekend;
    } else if (hour >= 5 && hour < 12) {
        return TIPS.morning;
    } else if (hour >= 12 && hour < 18) {
        return TIPS.afternoon;
    } else {
        return TIPS.evening;
    }
}

/**
 * Get a random tip from a category
 * @param {string} category
 * @returns {string}
 */
export function getRandomTip(category = 'productivity') {
    const tips = TIPS[category] || TIPS.productivity;
    return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Get a smart tip based on current state
 * @param {Object} state - App state
 * @returns {string}
 */
export function getSmartTip(state) {
    const inbox = state.inbox || [];
    const shipToday = state.shipToday || [];
    const next = state.next || [];

    // Priority-based tips
    if (inbox.length > 10) {
        return '📥 Your Inbox has 10+ items. Time to process!';
    }
    if (inbox.length === 0) {
        return getRandomTip('afterInboxZero');
    }
    if (shipToday.length === 0) {
        return '🚀 Ship Today is empty. Pick 1-3 items from Next!';
    }
    if (shipToday.length > 5) {
        return '⚠️ Too much in Ship Today? Focus on top 3.';
    }
    if (next.length === 0 && inbox.length > 0) {
        return '📋 Process Inbox items into Next for this week.';
    }

    // Default to time-based
    return getTimeTips()[Math.floor(Math.random() * getTimeTips().length)];
}

/**
 * Get action-based tip
 * @param {'ship' | 'capture' | 'delete' | 'move'} action
 * @returns {string}
 */
export function getActionTip(action) {
    const actionTips = {
        ship: TIPS.afterShip,
        capture: TIPS.afterCapture,
        delete: ['🗑️ Decluttered! Less is more.'],
        move: ['↔️ Reorganized. Nice prioritization!']
    };
    const tips = actionTips[action] || TIPS.motivation;
    return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Get all tips as flat array
 * @returns {string[]}
 */
export function getAllTips() {
    return Object.values(TIPS).flat();
}

/**
 * Get tip count
 * @returns {number}
 */
export function getTipCount() {
    return getAllTips().length;
}

// Track shown tips to avoid repetition
let shownTips = new Set();
let lastTipTime = 0;
const TIP_COOLDOWN = 60000; // 1 minute between tips

/**
 * Check if we should show a tip (respects cooldown)
 * @returns {boolean}
 */
export function shouldShowTip() {
    return Date.now() - lastTipTime > TIP_COOLDOWN;
}

/**
 * Show a tip as a toast notification
 * @param {string} [tip] - Specific tip to show, or random if not provided
 * @param {string} [category] - Category to pick from if no tip provided
 */
export function showTipToast(tip, category) {
    if (!shouldShowTip()) return;

    const tipText = tip || getRandomTip(category || 'productivity');

    // Avoid repeating tips
    if (shownTips.has(tipText)) {
        // Try to get a different tip
        const allTips = category ? TIPS[category] : getAllTips();
        const unshownTips = allTips.filter(t => !shownTips.has(t));
        if (unshownTips.length > 0) {
            showTipToast(unshownTips[Math.floor(Math.random() * unshownTips.length)]);
            return;
        }
        // Reset if all tips shown
        shownTips.clear();
    }

    shownTips.add(tipText);
    lastTipTime = Date.now();

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast toast-tip';
    toast.innerHTML = `
        <span class="toast-icon">💡</span>
        <span class="toast-message">${tipText}</span>
    `;

    // Add to DOM
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

/**
 * Show a smart tip based on current state
 * @param {Object} state - App state
 */
export function showSmartTipToast(state) {
    if (!shouldShowTip()) return;
    const tip = getSmartTip(state);
    showTipToast(tip);
}

/**
 * Show an action-based tip
 * @param {'ship' | 'capture' | 'delete' | 'move'} action
 */
export function showActionTipToast(action) {
    // 30% chance to show tip after action (not too annoying)
    if (Math.random() > 0.3) return;
    if (!shouldShowTip()) return;

    const tip = getActionTip(action);
    showTipToast(tip);
}

/**
 * Show startup tip
 * @param {Object} state - App state
 */
export function showStartupTip(state) {
    // Delay startup tip by 2 seconds
    setTimeout(() => {
        showSmartTipToast(state);
    }, 2000);
}

/**
 * Reset tip tracking (for testing)
 */
export function resetTipTracking() {
    shownTips.clear();
    lastTipTime = 0;
}

export default {
    TIPS,
    getTimeTips,
    getRandomTip,
    getSmartTip,
    getActionTip,
    getAllTips,
    getTipCount,
    shouldShowTip,
    showTipToast,
    showSmartTipToast,
    showActionTipToast,
    showStartupTip,
    resetTipTracking
};
