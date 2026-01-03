/**
 * State management for Commander PWA
 * Handles document state, autosave, and undo
 * @module state
 */

import { saveDocument, loadDocument, savePendingWrite, createDefaultDocument } from './db.js';

/** @typedef {{ id: string, text: string }} Item */
/** @typedef {{ id: string, createdAt: string, source: 'manual'|'clipboard', route: string, tags: string[], content: string }} LogEntry */
/** @typedef {{ inbox: Item[], next: Item[], shipToday: Item[], logs: LogEntry[] }} Document */

/**
 * @type {Document}
 */
let state = createDefaultDocument();

/**
 * @type {Document | null}
 */
let undoState = null;

/**
 * @type {number | null}
 */
let saveTimeout = null;

/**
 * @type {Set<Function>}
 */
const listeners = new Set();

/**
 * @type {'idle' | 'saving' | 'saved' | 'error'}
 */
let saveStatus = 'idle';

/**
 * @type {string}
 */
let currentView = 'tasks'; // 'tasks' or 'capture'

const DEBOUNCE_MS = 300;

/**
 * Generate a unique ID for items
 * @returns {string}
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Get current state
 * @returns {Document}
 */
export function getState() {
    return state;
}

/**
 * Get current save status
 * @returns {'idle' | 'saving' | 'saved' | 'error'}
 */
export function getSaveStatus() {
    return saveStatus;
}

/**
 * Get current view
 * @returns {string}
 */
export function getCurrentView() {
    return currentView;
}

/**
 * Set current view
 * @param {'tasks' | 'capture'} view
 */
export function setCurrentView(view) {
    currentView = view;
    notifyListeners();
}

/**
 * Subscribe to state changes
 * @param {Function} listener
 * @returns {Function} Unsubscribe function
 */
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Notify all listeners of state change
 */
function notifyListeners() {
    listeners.forEach(fn => fn(state, saveStatus, currentView));
}

/**
 * Update save status and notify
 * @param {'idle' | 'saving' | 'saved' | 'error'} status
 */
function setSaveStatus(status) {
    saveStatus = status;
    notifyListeners();
}

/**
 * Schedule a debounced save
 */
function scheduleSave() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    // Immediately save to pending for crash safety
    savePendingWrite(state).catch(console.error);

    setSaveStatus('saving');

    saveTimeout = setTimeout(async () => {
        try {
            await saveDocument(state);
            setSaveStatus('saved');

            // Reset to idle after 2 seconds
            setTimeout(() => {
                if (saveStatus === 'saved') {
                    setSaveStatus('idle');
                }
            }, 2000);
        } catch (err) {
            console.error('[State] Save failed:', err);
            setSaveStatus('error');
        }
    }, DEBOUNCE_MS);
}

/**
 * Store current state for undo
 */
function storeUndo() {
    undoState = JSON.parse(JSON.stringify(state));
}

/**
 * Initialize state from database
 * @returns {Promise<void>}
 */
export async function initState() {
    try {
        const doc = await loadDocument();
        if (doc) {
            state = {
                inbox: doc.inbox || [],
                next: doc.next || [],
                shipToday: doc.shipToday || [],
                logs: doc.logs || [],
            };
        }
        notifyListeners();
    } catch (err) {
        console.error('[State] Failed to load:', err);
        state = createDefaultDocument();
        notifyListeners();
    }
}

/**
 * Add an item to a section
 * @param {'inbox' | 'next' | 'shipToday'} section
 * @param {string} text
 * @returns {string} The new item's ID
 */
export function addItem(section, text = '') {
    storeUndo();

    const item = {
        id: generateId(),
        text: text,
    };

    state[section] = [...state[section], item];
    scheduleSave();
    notifyListeners();

    return item.id;
}

/**
 * Update an item's text
 * @param {'inbox' | 'next' | 'shipToday'} section
 * @param {string} id
 * @param {string} text
 */
export function updateItem(section, id, text) {
    const index = state[section].findIndex(item => item.id === id);
    if (index === -1) return;

    // Only store undo if this is a new edit session
    // (not just typing more characters)
    if (!saveTimeout) {
        storeUndo();
    }

    state[section] = state[section].map(item =>
        item.id === id ? { ...item, text } : item
    );

    scheduleSave();
    notifyListeners();
}

/**
 * Delete an item
 * @param {'inbox' | 'next' | 'shipToday'} section
 * @param {string} id
 */
export function deleteItem(section, id) {
    storeUndo();

    state[section] = state[section].filter(item => item.id !== id);
    scheduleSave();
    notifyListeners();
}

/**
 * Move an item to a different section
 * @param {'inbox' | 'next' | 'shipToday'} fromSection
 * @param {'inbox' | 'next' | 'shipToday'} toSection
 * @param {string} id
 */
export function moveItem(fromSection, toSection, id) {
    if (fromSection === toSection) return;

    storeUndo();

    const item = state[fromSection].find(item => item.id === id);
    if (!item) return;

    state[fromSection] = state[fromSection].filter(item => item.id !== id);
    state[toSection] = [...state[toSection], item];

    scheduleSave();
    notifyListeners();
}

/**
 * Clear all items in a section
 * @param {'inbox' | 'next' | 'shipToday'} section
 */
export function clearSection(section) {
    storeUndo();

    state[section] = [];
    scheduleSave();
    notifyListeners();
}

/**
 * Clear all items in all sections
 */
export function clearAll() {
    storeUndo();

    state = createDefaultDocument();
    scheduleSave();
    notifyListeners();
}

/**
 * Undo the last action
 * @returns {boolean} True if undo was performed
 */
export function undo() {
    if (!undoState) return false;

    const current = state;
    state = undoState;
    undoState = current; // Allow redo by undoing again

    scheduleSave();
    notifyListeners();
    return true;
}

/**
 * Check if undo is available
 * @returns {boolean}
 */
export function canUndo() {
    return undoState !== null;
}

/**
 * Import state from JSON data
 * @param {Object} data
 */
export async function importFromJSON(data) {
    storeUndo();

    state = {
        inbox: Array.isArray(data.inbox) ? data.inbox : [],
        next: Array.isArray(data.next) ? data.next : [],
        shipToday: Array.isArray(data.shipToday) ? data.shipToday : [],
        logs: Array.isArray(data.logs) ? data.logs : [],
    };

    await saveDocument(state);
    notifyListeners();
}

// ============================================
// LOGS MANAGEMENT
// ============================================

/**
 * Add a log entry
 * @param {string} content - The log content
 * @param {'manual'|'clipboard'} source - How the log was captured
 * @param {string} route - Target route (logs, inbox, next, ship)
 * @param {string[]} tags - Optional tags
 * @returns {string} The new log's ID
 */
export function addLog(content, source = 'manual', route = 'logs', tags = []) {
    storeUndo();

    const logEntry = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        source,
        route,
        tags,
        content: content.trim(),
    };

    // Add to logs array (newest first)
    state.logs = [logEntry, ...state.logs];

    // If route is a task section, also add as item there
    if (route === 'inbox' || route === 'next' || route === 'shipToday') {
        const item = {
            id: generateId(),
            text: content.trim(),
        };
        state[route] = [...state[route], item];
    }

    scheduleSave();
    notifyListeners();

    return logEntry.id;
}

/**
 * Delete a log entry
 * @param {string} id
 */
export function deleteLog(id) {
    storeUndo();

    state.logs = state.logs.filter(log => log.id !== id);
    scheduleSave();
    notifyListeners();
}

/**
 * Get all logs
 * @returns {LogEntry[]}
 */
export function getLogs() {
    return state.logs || [];
}

/**
 * Search logs by content
 * @param {string} query - Search query
 * @returns {LogEntry[]}
 */
export function searchLogs(query) {
    if (!query || !query.trim()) {
        return state.logs || [];
    }

    const lowerQuery = query.toLowerCase().trim();
    return (state.logs || []).filter(log =>
        log.content.toLowerCase().includes(lowerQuery) ||
        log.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

/**
 * Clear all logs
 */
export function clearLogs() {
    storeUndo();
    state.logs = [];
    scheduleSave();
    notifyListeners();
}

// ============================================
// SHIPPED ITEMS TRACKING
// ============================================

/**
 * Mark an item as shipped with required metadata
 * @param {string} section - Source section
 * @param {string} id - Item ID
 * @param {string} saveAs - Required save name
 * @param {string} definitionOfDone - Required DoD
 * @returns {Object|null} The shipped item or null if requirements not met
 */
export function markShipped(section, id, saveAs, definitionOfDone) {
    if (!saveAs || !saveAs.trim()) {
        throw new Error('Save As is required');
    }
    if (!definitionOfDone || !definitionOfDone.trim()) {
        throw new Error('Definition of Done is required');
    }

    storeUndo();

    const item = state[section]?.find(i => i.id === id);
    if (!item) return null;

    // Create shipped entry
    const shippedEntry = {
        id: generateId(),
        originalId: id,
        text: item.text,
        saveAs: saveAs.trim(),
        definitionOfDone: definitionOfDone.trim(),
        shippedAt: new Date().toISOString(),
        fromSection: section,
        logLine: `${new Date().toLocaleTimeString()} | SHIPPED: ${saveAs.trim()} — DoD: ${definitionOfDone.trim()}`,
    };

    // Initialize shipped array if needed
    if (!state.shipped) state.shipped = [];

    // Add to shipped
    state.shipped.unshift(shippedEntry);

    // Remove from original section
    state[section] = state[section].filter(i => i.id !== id);

    scheduleSave();
    notifyListeners();

    return shippedEntry;
}

/**
 * Get today's shipped items
 * @returns {Array}
 */
export function getTodayShipped() {
    if (!state.shipped) return [];

    const today = new Date().toISOString().split('T')[0];
    return state.shipped.filter(item =>
        item.shippedAt && item.shippedAt.startsWith(today)
    );
}

/**
 * Get all shipped items
 * @returns {Array}
 */
export function getAllShipped() {
    return state.shipped || [];
}

/**
 * Import merged state (safe merge with deduplication)
 * @param {Object} mergedData - Data with inbox, next, shipToday, logs
 */
export async function importMerged(mergedData) {
    storeUndo();

    state = {
        inbox: mergedData.inbox || [],
        next: mergedData.next || [],
        shipToday: mergedData.shipToday || [],
        logs: mergedData.logs || [],
        shipped: state.shipped || [], // Preserve shipped items
    };

    await saveDocument(state);
    notifyListeners();
}

/**
 * Check if service worker is ready (for offline indicator)
 * @returns {Promise<boolean>}
 */
export async function checkOfflineReady() {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.ready;
    return !!registration.active;
}



