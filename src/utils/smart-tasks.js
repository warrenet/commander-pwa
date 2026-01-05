/**
 * Smart Task Analysis (No API)
 * Duplicate detection, priority inference, time estimation
 * @module utils/smart-tasks
 */

/**
 * Levenshtein distance for fuzzy matching
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

/**
 * Calculate similarity score (0-1)
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function similarity(a, b) {
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();
    if (aLower === bLower) return 1;
    const maxLen = Math.max(aLower.length, bLower.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(aLower, bLower) / maxLen;
}

/**
 * Find similar/duplicate tasks
 * @param {string} newText - New task text
 * @param {Array<{id: string, text: string}>} existingTasks
 * @param {number} [threshold=0.7] - Similarity threshold
 * @returns {Array<{task: Object, score: number}>}
 */
export function findDuplicates(newText, existingTasks, threshold = 0.7) {
    const matches = [];

    for (const task of existingTasks) {
        const score = similarity(newText, task.text);
        if (score >= threshold) {
            matches.push({ task, score });
        }
    }

    return matches.sort((a, b) => b.score - a.score);
}

/**
 * Priority keywords and scores
 */
const PRIORITY_RULES = {
    high: {
        keywords: ['urgent', 'asap', 'critical', 'emergency', 'deadline', 'important', 'priority', 'now', 'immediately'],
        patterns: [/!{2,}/, /\bP1\b/i, /\bhigh\s*priority\b/i]
    },
    medium: {
        keywords: ['soon', 'needed', 'should', 'want'],
        patterns: [/\bP2\b/i, /\bmedium\s*priority\b/i]
    },
    low: {
        keywords: ['someday', 'maybe', 'eventually', 'later', 'when possible', 'nice to have', 'optional'],
        patterns: [/\bP3\b/i, /\blow\s*priority\b/i, /\bbacklog\b/i]
    }
};

/**
 * Infer priority from task text
 * @param {string} text
 * @returns {{ priority: 'high' | 'medium' | 'low' | 'normal', confidence: number, reason: string }}
 */
export function inferPriority(text) {
    const lowerText = text.toLowerCase();

    // Check high priority
    for (const keyword of PRIORITY_RULES.high.keywords) {
        if (lowerText.includes(keyword)) {
            return { priority: 'high', confidence: 0.9, reason: `Contains "${keyword}"` };
        }
    }
    for (const pattern of PRIORITY_RULES.high.patterns) {
        if (pattern.test(text)) {
            return { priority: 'high', confidence: 0.95, reason: 'Pattern match' };
        }
    }

    // Check low priority
    for (const keyword of PRIORITY_RULES.low.keywords) {
        if (lowerText.includes(keyword)) {
            return { priority: 'low', confidence: 0.8, reason: `Contains "${keyword}"` };
        }
    }
    for (const pattern of PRIORITY_RULES.low.patterns) {
        if (pattern.test(text)) {
            return { priority: 'low', confidence: 0.85, reason: 'Pattern match' };
        }
    }

    // Check medium priority
    for (const keyword of PRIORITY_RULES.medium.keywords) {
        if (lowerText.includes(keyword)) {
            return { priority: 'medium', confidence: 0.7, reason: `Contains "${keyword}"` };
        }
    }

    return { priority: 'normal', confidence: 0.5, reason: 'No priority indicators' };
}

/**
 * Time estimation keywords (in minutes)
 */
const TIME_ESTIMATES = {
    // Quick tasks
    quick: { keywords: ['quick', 'brief', 'short', 'fast', 'simple'], minutes: 10 },
    call: { keywords: ['call', 'phone', 'dial'], minutes: 15 },
    email: { keywords: ['email', 'reply', 'respond', 'message'], minutes: 10 },

    // Medium tasks
    review: { keywords: ['review', 'check', 'verify', 'audit'], minutes: 30 },
    meeting: { keywords: ['meeting', 'meet', 'sync', 'standup', '1:1'], minutes: 30 },
    write: { keywords: ['write', 'draft', 'compose', 'document'], minutes: 45 },

    // Longer tasks
    code: { keywords: ['code', 'implement', 'develop', 'build', 'create'], minutes: 60 },
    design: { keywords: ['design', 'mockup', 'wireframe', 'prototype'], minutes: 60 },
    research: { keywords: ['research', 'investigate', 'explore', 'analyze'], minutes: 45 },

    // Long tasks
    blog: { keywords: ['blog', 'article', 'post'], minutes: 120 },
    deploy: { keywords: ['deploy', 'release', 'ship', 'launch'], minutes: 30 },
    debug: { keywords: ['debug', 'fix', 'troubleshoot', 'investigate'], minutes: 45 }
};

/**
 * Estimate time for a task
 * @param {string} text
 * @returns {{ minutes: number, confidence: number, reason: string }}
 */
export function estimateTime(text) {
    const lowerText = text.toLowerCase();

    for (const [category, config] of Object.entries(TIME_ESTIMATES)) {
        for (const keyword of config.keywords) {
            if (lowerText.includes(keyword)) {
                return {
                    minutes: config.minutes,
                    confidence: 0.7,
                    reason: `"${keyword}" typically takes ~${config.minutes} min`
                };
            }
        }
    }

    // Default estimate based on text length
    const wordCount = text.split(/\s+/).length;
    const defaultMinutes = Math.min(60, Math.max(15, wordCount * 5));

    return {
        minutes: defaultMinutes,
        confidence: 0.3,
        reason: 'Default estimate'
    };
}

/**
 * Format minutes as human-readable duration
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

/**
 * Analyze a task comprehensively
 * @param {string} text
 * @param {Array} existingTasks
 * @returns {Object}
 */
export function analyzeTask(text, existingTasks = []) {
    return {
        priority: inferPriority(text),
        timeEstimate: estimateTime(text),
        duplicates: findDuplicates(text, existingTasks, 0.6),
        wordCount: text.split(/\s+/).length
    };
}

export default {
    similarity,
    findDuplicates,
    inferPriority,
    estimateTime,
    formatDuration,
    analyzeTask
};
