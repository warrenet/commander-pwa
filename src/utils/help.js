/**
 * Help & Onboarding System
 * Comprehensive documentation for all features
 * @module utils/help
 */

/**
 * Feature categories with all help content
 */
export const HELP_CONTENT = {
    // Core Features
    tasks: {
        title: '📋 Task Management',
        description: 'Organize your tasks into three zones',
        items: [
            { name: 'Inbox', icon: '📥', tip: 'Capture everything here first. Process later.' },
            { name: 'Next', icon: '📋', tip: 'Tasks you plan to do soon.' },
            { name: 'Ship Today', icon: '🚀', tip: 'Your focus for today. Keep this small!' }
        ],
        tips: [
            'Swipe right on a task to move it forward',
            'Long-press to open context menu',
            'Tap to edit task text inline'
        ]
    },

    capture: {
        title: '✏️ Capture',
        description: 'Quick ways to add tasks and logs',
        items: [
            { name: 'Text Capture', icon: '📝', tip: 'Type or paste text, then save.' },
            { name: 'Voice Capture', icon: '🎤', tip: 'Click mic and speak. Auto-transcribes.' },
            { name: 'Templates', icon: '📋', tip: 'Pre-made formats for common logs.' },
            { name: 'Paste Split', icon: '✂️', tip: 'Paste a list → splits into separate tasks.' }
        ],
        tips: [
            'Say "Protocol [name]" to auto-fill that template',
            'Templates include Mission Control, Nightly Delta, Weekly Review',
            'Voice capture works offline!'
        ]
    },

    productivity: {
        title: '🎯 Productivity Tools',
        description: 'Features to help you focus and achieve',
        items: [
            { name: 'Focus Mode', icon: '🔒', tip: 'Hides everything except Ship Today.' },
            { name: 'Pomodoro Timer', icon: '🍅', tip: '25-minute focus sessions with logging.' },
            { name: 'Keyboard Shortcuts', icon: '⌨️', tip: 'Vim-style navigation (j/k/d/m/n).' },
            { name: 'Inbox Zero Streak', icon: '🔥', tip: 'Track consecutive days with empty inbox.' }
        ],
        tips: [
            'Press ? to see all keyboard shortcuts',
            'Pomodoro sessions are automatically logged',
            'Focus Mode shows a badge at the top'
        ]
    },

    ai: {
        title: '🤖 AI Integration',
        description: 'Get AI help without any API keys',
        items: [
            { name: 'AI Prioritize', icon: '🎯', tip: 'Copies a prompt asking AI to rank your tasks.' },
            { name: 'AI Break Down', icon: '🔨', tip: 'Ask AI to split a big task into steps.' },
            { name: 'AI Plan Day', icon: '📅', tip: 'Generate a time-blocked schedule.' },
            { name: 'Daily Debrief', icon: '🧠', tip: 'Copy today\'s logs for AI analysis.' }
        ],
        tips: [
            'No API key needed - just paste into free ChatGPT/Gemini',
            'AI responses can be imported via batch link',
            'Works with any AI: Claude, Copilot, etc.'
        ]
    },

    automation: {
        title: '🔗 Automation',
        description: 'MacroDroid and deep link integrations',
        items: [
            { name: 'Deep Links', icon: '🔗', tip: 'Add tasks via URL parameters.' },
            { name: 'Batch Import', icon: '📦', tip: '?batch=["task1","task2"] adds multiple tasks.' },
            { name: 'MacroDroid', icon: '🤖', tip: 'Schedule tasks, location triggers, voice commands.' },
            { name: 'Quartermaster', icon: '⚡', tip: 'Time-aware FAB suggests appropriate action.' }
        ],
        tips: [
            'Morning: Quartermaster suggests Mission Control',
            'Evening: Quartermaster suggests Nightly Delta',
            'Sunday: Quartermaster suggests Weekly Review'
        ]
    },

    data: {
        title: '📊 Data Management',
        description: 'Export, import, and manage your data',
        items: [
            { name: 'Export', icon: '📤', tip: 'Download all data as JSON.' },
            { name: 'Import', icon: '📥', tip: 'Restore from a backup file.' },
            { name: 'Weekly Export', icon: '📅', tip: 'Export last 7 days for AI review.' },
            { name: 'Nuke DB', icon: '💀', tip: 'Complete reset (use with caution!).' }
        ],
        tips: [
            'Export regularly for backups',
            'Data is stored locally in IndexedDB',
            'Works fully offline'
        ]
    },

    reliability: {
        title: '🛡️ Reliability',
        description: 'Built-in safeguards and recovery options',
        items: [
            { name: 'Safe Mode', icon: '🛠️', tip: 'Add ?safemode=1 to URL for troubleshooting.' },
            { name: 'Error Recovery', icon: '🔄', tip: 'Automatic error logging and recovery.' },
            { name: 'Offline First', icon: '📴', tip: 'Works without internet connection.' },
            { name: 'Auto-Save', icon: '💾', tip: 'Changes saved automatically to local storage.' }
        ],
        tips: [
            'Sunrise Protocol moves stale tasks back to Inbox',
            'Cache can be cleared from Diagnostics menu',
            'App version shown in Diagnostics'
        ]
    }
};

/**
 * Get all help categories
 * @returns {string[]}
 */
export function getCategories() {
    return Object.keys(HELP_CONTENT);
}

/**
 * Get help for a specific category
 * @param {string} category
 * @returns {Object|null}
 */
export function getHelp(category) {
    return HELP_CONTENT[category] || null;
}

/**
 * Get a random tip
 * @returns {{ category: string, tip: string }}
 */
export function getRandomTip() {
    const categories = getCategories();
    const category = categories[Math.floor(Math.random() * categories.length)];
    const tips = HELP_CONTENT[category].tips;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return { category, tip };
}

/**
 * Get contextual help based on current view
 * @param {string} view - 'tasks' | 'capture' | 'logs'
 * @returns {Object}
 */
export function getContextualHelp(view) {
    const contextMap = {
        tasks: HELP_CONTENT.tasks,
        capture: HELP_CONTENT.capture,
        logs: HELP_CONTENT.data
    };
    return contextMap[view] || HELP_CONTENT.tasks;
}

/**
 * Generate onboarding steps
 * @returns {Array<{ step: number, title: string, content: string, action: string }>}
 */
export function getOnboardingSteps() {
    return [
        {
            step: 1,
            title: 'Welcome to Commander! 🚀',
            content: 'Your personal execution cockpit. Capture, organize, and ship tasks.',
            action: 'Next'
        },
        {
            step: 2,
            title: 'Three Zones 📥📋🚀',
            content: 'Inbox: Dump everything. Next: Coming soon. Ship Today: Your focus.',
            action: 'Next'
        },
        {
            step: 3,
            title: 'Quick Capture ✏️',
            content: 'Use the Capture tab to add tasks. Voice, text, or templates!',
            action: 'Next'
        },
        {
            step: 4,
            title: 'AI Superpowers 🤖',
            content: 'Copy prompts to paste into ChatGPT/Gemini. No API keys needed!',
            action: 'Next'
        },
        {
            step: 5,
            title: 'Quartermaster ⚡',
            content: 'The floating button changes based on time of day. Trust it!',
            action: 'Next'
        },
        {
            step: 6,
            title: 'Keyboard Power ⌨️',
            content: 'Press ? anytime to see shortcuts. j/k to navigate, d to delete.',
            action: 'Next'
        },
        {
            step: 7,
            title: 'You\'re Ready! 🎉',
            content: 'Start by adding a task to your Inbox. Menu → Help for more.',
            action: 'Start Using Commander'
        }
    ];
}

/**
 * Check if user has completed onboarding
 * @returns {boolean}
 */
export function hasCompletedOnboarding() {
    return localStorage.getItem('commander-onboarding-complete') === '1';
}

/**
 * Mark onboarding as complete
 */
export function completeOnboarding() {
    localStorage.setItem('commander-onboarding-complete', '1');
}

/**
 * Reset onboarding (for testing)
 */
export function resetOnboarding() {
    localStorage.removeItem('commander-onboarding-complete');
}

export default {
    HELP_CONTENT,
    getCategories,
    getHelp,
    getRandomTip,
    getContextualHelp,
    getOnboardingSteps,
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding
};
