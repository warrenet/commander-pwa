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
    md += '\n';

    // Add Logs section (newest first)
    md += '## Logs\n';
    const logs = state.logs || [];
    if (logs.length === 0) {
        md += '- (empty)\n';
    } else {
        logs.forEach(log => {
            const date = new Date(log.createdAt).toLocaleString();
            const preview = log.content.length > 100
                ? log.content.substring(0, 100) + '...'
                : log.content;
            // Replace newlines with space for single-line display
            const singleLine = preview.replace(/\n/g, ' ');
            md += `- [${date}] ${singleLine}\n`;
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
        version: 2,
        exportedAt: new Date().toISOString(),
        data: {
            inbox: state.inbox,
            next: state.next,
            shipToday: state.shipToday,
            logs: state.logs || [],
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
 * @returns {{ inbox: any[], next: any[], shipToday: any[], logs: any[] }}
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
        logs: [],
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

    // Parse logs
    if (Array.isArray(data.logs)) {
        result.logs = data.logs.map(log => {
            if (log && typeof log === 'object' && 'content' in log) {
                return {
                    id: log.id || generateId(),
                    createdAt: log.createdAt || new Date().toISOString(),
                    source: log.source || 'manual',
                    route: log.route || 'logs',
                    tags: Array.isArray(log.tags) ? log.tags : [],
                    content: String(log.content || ''),
                };
            }
            return null;
        }).filter(Boolean);
    }

    return result;
}

/**
 * Generate a unique ID
 * @returns {string}
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Export full backup with schema version and metadata
 * @returns {string}
 */
export function exportFullBackup() {
    const state = getState();

    const backup = {
        schemaVersion: 2,
        appVersion: typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : 'dev',
        createdAt: new Date().toISOString(),
        backup: true,
        data: {
            inbox: state.inbox || [],
            next: state.next || [],
            shipToday: state.shipToday || [],
            logs: state.logs || [],
        }
    };

    return JSON.stringify(backup, null, 2);
}

/**
 * Download full backup file
 */
export function downloadBackup() {
    const content = exportFullBackup();
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
    downloadFile(content, `commander-backup-${date}_${time}.json`, 'application/json');
}

/**
 * Parse backup and merge with existing data (deduplication)
 * @param {string} content - JSON string
 * @param {Object} existingState - Current state to merge with
 * @returns {{ inbox: any[], next: any[], shipToday: any[], logs: any[], stats: Object }}
 */
export function parseBackupWithMerge(content, existingState) {
    let parsed;

    try {
        parsed = JSON.parse(content);
    } catch (e) {
        throw new Error('Invalid JSON format');
    }

    // Handle both wrapped and unwrapped formats
    const data = parsed.data || parsed;

    if (!data || typeof data !== 'object') {
        throw new Error('Invalid backup structure');
    }

    const stats = {
        imported: { inbox: 0, next: 0, shipToday: 0, logs: 0 },
        skipped: { inbox: 0, next: 0, shipToday: 0, logs: 0 },
    };

    const result = {
        inbox: [...(existingState.inbox || [])],
        next: [...(existingState.next || [])],
        shipToday: [...(existingState.shipToday || [])],
        logs: [...(existingState.logs || [])],
    };

    // Helper: check if item exists by ID or content
    function itemExists(arr, item, contentKey) {
        return arr.some(existing =>
            existing.id === item.id ||
            (contentKey && existing[contentKey] === item[contentKey])
        );
    }

    // Merge task sections
    ['inbox', 'next', 'shipToday'].forEach(section => {
        if (Array.isArray(data[section])) {
            data[section].forEach(item => {
                if (!item) return;

                const normalized = typeof item === 'string'
                    ? { id: generateId(), text: item }
                    : { id: item.id || generateId(), text: String(item.text || '') };

                if (!itemExists(result[section], normalized, 'text')) {
                    result[section].push(normalized);
                    stats.imported[section]++;
                } else {
                    stats.skipped[section]++;
                }
            });
        }
    });

    // Merge logs
    if (Array.isArray(data.logs)) {
        data.logs.forEach(log => {
            if (!log || typeof log !== 'object' || !log.content) return;

            const normalized = {
                id: log.id || generateId(),
                createdAt: log.createdAt || new Date().toISOString(),
                source: log.source || 'import',
                route: log.route || 'logs',
                category: log.category || 'Note',
                tags: Array.isArray(log.tags) ? log.tags : [],
                content: String(log.content || ''),
            };

            if (!itemExists(result.logs, normalized, 'content')) {
                result.logs.push(normalized);
                stats.imported.logs++;
            } else {
                stats.skipped.logs++;
            }
        });
    }

    // Sort logs by createdAt (newest first)
    result.logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { ...result, stats };
}


