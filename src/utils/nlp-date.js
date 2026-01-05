/**
 * Natural Language Date Parsing (No API)
 * Parses dates from task text without external services
 * @module utils/nlp-date
 */

/**
 * Parse natural language date from text
 * @param {string} text - Task text to parse
 * @returns {{ date: Date | null, cleanedText: string, matched: string | null }}
 */
export function parseDate(text) {
    const now = new Date();
    let date = null;
    let matched = null;
    let cleanedText = text;

    // Patterns in order of specificity
    const patterns = [
        // Specific dates: "on Jan 15", "January 15th", "1/15"
        {
            regex: /\b(?:on\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/i,
            parse: (m) => {
                const month = parseInt(m[1]) - 1;
                const day = parseInt(m[2]);
                const year = m[3] ? (m[3].length === 2 ? 2000 + parseInt(m[3]) : parseInt(m[3])) : now.getFullYear();
                return new Date(year, month, day);
            }
        },
        // "next Monday", "this Friday"
        {
            regex: /\b(next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
            parse: (m) => getNextDayOfWeek(m[2], m[1].toLowerCase() === 'next')
        },
        // "on Monday", "Monday"
        {
            regex: /\b(?:on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
            parse: (m) => getNextDayOfWeek(m[1], false)
        },
        // "tomorrow"
        {
            regex: /\btomorrow\b/i,
            parse: () => addDays(now, 1)
        },
        // "today"
        {
            regex: /\btoday\b/i,
            parse: () => now
        },
        // "in X days/weeks/months"
        {
            regex: /\bin\s+(\d+)\s+(day|days|week|weeks|month|months)\b/i,
            parse: (m) => {
                const num = parseInt(m[1]);
                const unit = m[2].toLowerCase().replace(/s$/, '');
                if (unit === 'day') return addDays(now, num);
                if (unit === 'week') return addDays(now, num * 7);
                if (unit === 'month') return addMonths(now, num);
                return null;
            }
        },
        // "next week"
        {
            regex: /\bnext\s+week\b/i,
            parse: () => addDays(now, 7)
        },
        // "end of week", "EOW"
        {
            regex: /\b(end\s+of\s+week|eow)\b/i,
            parse: () => getEndOfWeek(now)
        },
        // "end of month", "EOM"
        {
            regex: /\b(end\s+of\s+month|eom)\b/i,
            parse: () => getEndOfMonth(now)
        },
        // Time patterns: "at 3pm", "at 14:00"
        {
            regex: /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i,
            parse: (m) => {
                let hours = parseInt(m[1]);
                const minutes = m[2] ? parseInt(m[2]) : 0;
                const ampm = m[3]?.toLowerCase();
                if (ampm === 'pm' && hours < 12) hours += 12;
                if (ampm === 'am' && hours === 12) hours = 0;
                const d = new Date(now);
                d.setHours(hours, minutes, 0, 0);
                return d;
            }
        }
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern.regex);
        if (match) {
            date = pattern.parse(match);
            matched = match[0];
            cleanedText = text.replace(pattern.regex, '').trim().replace(/\s+/g, ' ');
            break;
        }
    }

    return { date, cleanedText, matched };
}

/**
 * Get next occurrence of a day of week
 * @param {string} dayName
 * @param {boolean} skipThisWeek
 * @returns {Date}
 */
function getNextDayOfWeek(dayName, skipThisWeek = false) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    const now = new Date();
    const currentDay = now.getDay();

    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0 || skipThisWeek) {
        daysUntil += 7;
    }

    return addDays(now, daysUntil);
}

/**
 * Add days to a date
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Add months to a date
 * @param {Date} date
 * @param {number} months
 * @returns {Date}
 */
function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

/**
 * Get end of week (Friday)
 * @param {Date} date
 * @returns {Date}
 */
function getEndOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay();
    const daysUntilFriday = (5 - day + 7) % 7 || 7;
    result.setDate(result.getDate() + daysUntilFriday);
    return result;
}

/**
 * Get end of month
 * @param {Date} date
 * @returns {Date}
 */
function getEndOfMonth(date) {
    const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return result;
}

/**
 * Format date for display
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
    if (!date) return '';
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Get relative date string
 * @param {Date} date
 * @returns {string}
 */
export function getRelativeDate(date) {
    if (!date) return '';
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;

    return formatDate(date);
}

export default {
    parseDate,
    formatDate,
    getRelativeDate
};
