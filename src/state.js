/**
 * State management for Commander PWA
 * Handles document state, autosave, and undo
 * @module state
 */

import { saveDocument, loadDocument, savePendingWrite, createDefaultDocument } from './db.js';

/** @typedef {{ id: string, text: string }} Item */
/** @typedef {{ inbox: Item[], next: Item[], shipToday: Item[] }} Document */

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
    listeners.forEach(fn => fn(state, saveStatus));
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
    };

    await saveDocument(state);
    notifyListeners();
}
