/**
 * Standard Capture Templates
 * @module templates
 */

export const TEMPLATES = [
    {
        id: 'bug',
        icon: '🐛',
        label: 'Bug Report',
        content: `[BUG] 
Context: 
Expected: 
Actual: `
    },
    {
        id: 'idea',
        icon: '💡',
        label: 'Idea',
        content: `[IDEA] 
Goal: 
First Step: `
    },
    {
        id: 'log',
        icon: '🪵',
        label: 'Daily Log',
        content: `#log 
Wins: 
Blockers: `
    },
    {
        id: 'meeting',
        icon: '📅',
        label: 'Meeting Note',
        content: `[MEETING] 
Who: 
Action Items:
- `
    }
];

/**
 * Get all templates
 * @returns {Array}
 */
export function getTemplateList() {
    return TEMPLATES;
}

/**
 * Get a specific template content
 * @param {string} id 
 * @returns {string}
 */
export function getFilledTemplate(id) {
    const t = TEMPLATES.find(x => x.id === id);
    return t ? t.content : '';
}
