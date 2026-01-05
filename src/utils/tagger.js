/**
 * Semantic Auto-Tagger (MOONSHOT-01)
 * Automatically applies tags based on task text content
 * @module tagger
 */

/**
 * Tagging rules configuration
 * Pattern: regex to match | Tag: tag to apply
 */
const TAGGING_RULES = [
    // Errands & Shopping
    { pattern: /\b(buy|get|pick up|grab|shop)\b/i, tag: '#errand' },
    { pattern: /\b(groceries|store|market)\b/i, tag: '#errand' },

    // Development & Tech
    { pattern: /\b(fix|debug|code|deploy|refactor|test)\b/i, tag: '#dev' },
    { pattern: /\b(bug|error|crash|issue)\b/i, tag: '#dev' },
    { pattern: /\b(API|database|server|frontend|backend)\b/i, tag: '#dev' },

    // Communication
    { pattern: /\b(call|email|text|message|reach out|contact)\b/i, tag: '#comms' },
    { pattern: /\b(meet|meeting|sync|standup)\b/i, tag: '#comms' },

    // Health & Wellness
    { pattern: /\b(exercise|workout|gym|run|walk|yoga)\b/i, tag: '#health' },
    { pattern: /\b(doctor|dentist|appointment|medication)\b/i, tag: '#health' },

    // Finance
    { pattern: /\b(pay|bill|invoice|budget|expense|money)\b/i, tag: '#finance' },
    { pattern: /\b(bank|transfer|deposit)\b/i, tag: '#finance' },

    // Learning
    { pattern: /\b(read|learn|study|research|course)\b/i, tag: '#learn' },
    { pattern: /\b(book|article|tutorial|video)\b/i, tag: '#learn' },

    // Home
    { pattern: /\b(clean|organize|laundry|dishes|vacuum)\b/i, tag: '#home' },
    { pattern: /\b(repair|fix|maintenance)\b/i, tag: '#home' },

    // Work
    { pattern: /\b(report|presentation|proposal|deadline)\b/i, tag: '#work' },
    { pattern: /\b(client|project|task|review)\b/i, tag: '#work' },

    // Priority markers
    { pattern: /\b(urgent|asap|important|critical)\b/i, tag: '#priority' },
    { pattern: /\b(today|now|immediately)\b/i, tag: '#priority' },

    // Waiting/Blocked
    { pattern: /\b(waiting|blocked|pending|on hold)\b/i, tag: '#waiting' }
];

/**
 * Analyze text and return suggested tags
 * @param {string} text - The task text to analyze
 * @returns {string[]} Array of suggested tags (unique, no duplicates)
 */
export function suggestTags(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const matchedTags = new Set();

    for (const rule of TAGGING_RULES) {
        if (rule.pattern.test(text)) {
            matchedTags.add(rule.tag);
        }
    }

    return Array.from(matchedTags);
}

/**
 * Auto-tag text and return text with tags appended
 * @param {string} text - Original task text
 * @returns {{ text: string, tags: string[] }} Object with original text and suggested tags
 */
export function autoTag(text) {
    const tags = suggestTags(text);
    return {
        text: text,
        tags: tags
    };
}

/**
 * Add custom tagging rule at runtime
 * @param {RegExp} pattern - Regex pattern to match
 * @param {string} tag - Tag to apply (including #)
 */
export function addRule(pattern, tag) {
    if (pattern instanceof RegExp && typeof tag === 'string') {
        TAGGING_RULES.push({ pattern, tag });
    }
}

/**
 * Get all current tagging rules (for debugging/config UI)
 * @returns {Array<{ pattern: RegExp, tag: string }>}
 */
export function getRules() {
    return [...TAGGING_RULES];
}

export default {
    suggestTags,
    autoTag,
    addRule,
    getRules
};
