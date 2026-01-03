/**
 * Export and Import functionality for Commander PWA
 * Supports .md and .json formats
 * @module export
 */

import { getState } from './state.js';

/**
 * Export current state as Markdown
 * @returns {string}
 */
export function exportAsMarkdown() {
    const state = getState();

    let md = '# Commander\n\n';

    md += '## Inbox\n';
    if (state.inbox.length === 0) {
        md += '- (empty)\n';
    } else {
        state.inbox.forEach(item => {
            md += `- ${item.text || '(empty)'}\n`;
        });
    }
    md += '\n';

    md += '## Next\n';
    if (state.next.length === 0) {
        md += '- (empty)\n';
    } else {
        state.next.forEach(item => {
            md += `- ${item.text || '(empty)'}\n`;
        });
    }
    md += '\n';

    md += '## Ship Today\n';
    if (state.shipToday.length === 0) {
        md += '- (empty)\n';
    } else {
        state.shipToday.forEach(item => {
            md += `- ${item.text || '(empty)'}\n`;
        });
    }

    return md;
}

/**
 * Export current state as JSON
 * @returns {string}
 */
export function exportAsJSON() {
    const state = getState();

    const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
            inbox: state.inbox,
            next: state.next,
            shipToday: state.shipToday,
        }
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Download a file with the given content
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Download state as Markdown file
 */
export function downloadMarkdown() {
    const content = exportAsMarkdown();
    const date = new Date().toISOString().split('T')[0];
    downloadFile(content, `commander-${date}.md`, 'text/markdown');
}

/**
 * Download state as JSON file
 */
export function downloadJSON() {
    const content = exportAsJSON();
    const date = new Date().toISOString().split('T')[0];
    downloadFile(content, `commander-${date}.json`, 'application/json');
}

/**
 * Parse and validate imported JSON
 * @param {string} content - JSON string
 * @returns {{ inbox: any[], next: any[], shipToday: any[] }}
 * @throws {Error} If validation fails
 */
export function parseImportedJSON(content) {
    let parsed;

    try {
        parsed = JSON.parse(content);
    } catch (e) {
        throw new Error('Invalid JSON format');
    }

    // Handle both wrapped and unwrapped formats
    const data = parsed.data || parsed;

    // Validate structure
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure');
    }

    // Validate and normalize arrays
    const result = {
        inbox: [],
        next: [],
        shipToday: [],
    };

    ['inbox', 'next', 'shipToday'].forEach(section => {
        if (Array.isArray(data[section])) {
            result[section] = data[section].map(item => {
                if (typeof item === 'string') {
                    return { id: generateId(), text: item };
                }
                if (item && typeof item === 'object' && 'text' in item) {
                    return {
                        id: item.id || generateId(),
                        text: String(item.text || ''),
                    };
                }
                return null;
            }).filter(Boolean);
        }
    });

    return result;
}

/**
 * Generate a unique ID
 * @returns {string}
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
