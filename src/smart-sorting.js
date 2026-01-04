/**
 * Smart Sorting & Auto-Categorization Logic
 * @module smart-sorting
 */

// Default rules for auto-categorization
const RULES = [
    {
        keywords: ['bug', 'fix', 'error', 'fail', 'broken', 'crash'],
        tag: 'bug',
        category: 'Bug'
    },
    {
        keywords: ['idea', 'feature', 'maybe', 'wish', 'cool'],
        tag: 'idea',
        category: 'Idea'
    },
    {
        keywords: ['meeting', 'call', 'sync', 'discuss', 'chat', 'meet'],
        tag: 'meeting',
        category: 'Meeting'
    },
    {
        keywords: ['urgent', 'asap', 'critical', 'important', 'now', 'high priority'],
        tag: 'urgent',
        category: 'Urgent'
    },
    {
        keywords: ['buy', 'order', 'purchase', 'shop', 'get'],
        tag: 'shopping',
        category: 'Shopping'
    }
];

// Board columns configuration
const BOARD_COLUMNS = [
    { id: 'urgent', title: '🔥 Urgent', tags: ['urgent', 'priority-high'] },
    { id: 'bug', title: '🐛 Bugs', tags: ['bug', 'fix'] },
    { id: 'meeting', title: '📅 Meetings', tags: ['meeting'] },
    { id: 'idea', title: '💡 Ideas', tags: ['idea'] },
    { id: 'shopping', title: '🛒 Shopping', tags: ['shopping'] },
    { id: 'other', title: '📝 Tasks', tags: [] } // Fallback
];

/**
 * Auto-categorize text based on keywords
 * @param {string} text 
 * @returns {{ tags: string[], category: string|null }}
 */
export function autoCategorize(text) {
    const lowerText = text.toLowerCase();
    const tags = [];
    let category = null;

    RULES.forEach(rule => {
        if (rule.keywords.some(k => lowerText.includes(k))) {
            tags.push(rule.tag);
            // First matching rule sets the category hint
            if (!category) category = rule.category;
        }
    });

    return { tags, category };
}

/**
 * Group items into board sections
 * @param {Array} items - List of all items (inbox, next, shipToday)
 * @returns {Array} - Array of column objects { id, title, items: [] }
 */
export function getBoardSections(items) {
    // Initialize columns
    const columns = BOARD_COLUMNS.map(col => ({
        ...col,
        items: []
    }));

    items.forEach(item => {
        const itemTags = (item.tags || []).map(t => t.toLowerCase().replace('#', ''));
        let placed = false;

        // Try to place in specific columns first
        for (const col of columns) {
            if (col.id === 'other') continue;

            // Check if item has any tag matching the column's tags
            if (col.tags.some(t => itemTags.includes(t))) {
                col.items.push(item);
                placed = true;
                break; // Item goes to first matching column (priority order defined in BOARD_COLUMNS)
            }
        }

        // Fallback to 'other' column
        if (!placed) {
            const otherCol = columns.find(c => c.id === 'other');
            if (otherCol) otherCol.items.push(item);
        }
    });

    return columns;
}
