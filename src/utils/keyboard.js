/**
 * Keyboard Navigator (BONUS-01)
 * Vim-style keyboard shortcuts for power users
 * @module utils/keyboard
 */

import { tap } from './haptics.js';

/**
 * @typedef {Object} KeyboardConfig
 * @property {Function} onMove - Callback for move (j/k)
 * @property {Function} onDelete - Callback for delete (d)
 * @property {Function} onEdit - Callback for edit (Enter)
 * @property {Function} onMoveSection - Callback for move to section (m)
 * @property {Function} onEscape - Callback for escape (Esc)
 * @property {Function} onNewItem - Callback for new item (n)
 * @property {Function} onSectionJump - Callback for section jump (1/2/3)
 */

let selectedIndex = -1;
let items = [];
let config = null;

/**
 * Initialize keyboard navigation
 * @param {KeyboardConfig} options
 */
export function initKeyboard(options) {
    config = options;
    document.addEventListener('keydown', handleKeyDown);
}

/**
 * Update the list of navigable items
 * @param {NodeList|Array} newItems
 */
export function updateItems(newItems) {
    items = Array.from(newItems);
    if (selectedIndex >= items.length) {
        selectedIndex = Math.max(0, items.length - 1);
    }
}

/**
 * Get currently selected item
 * @returns {HTMLElement|null}
 */
export function getSelectedItem() {
    return items[selectedIndex] || null;
}

/**
 * Handle keyboard events
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e) {
    // Don't intercept if user is typing in an input
    if (e.target.matches('input, textarea, [contenteditable]')) {
        if (e.key === 'Escape') {
            e.target.blur();
            tap();
        }
        return;
    }

    switch (e.key) {
        case 'j':
        case 'ArrowDown':
            e.preventDefault();
            moveSelection(1);
            break;

        case 'k':
        case 'ArrowUp':
            e.preventDefault();
            moveSelection(-1);
            break;

        case 'Enter':
            e.preventDefault();
            if (config?.onEdit && selectedIndex >= 0) {
                config.onEdit(items[selectedIndex]);
                tap();
            }
            break;

        case 'd':
            e.preventDefault();
            if (config?.onDelete && selectedIndex >= 0) {
                config.onDelete(items[selectedIndex]);
                tap();
            }
            break;

        case 'm':
            e.preventDefault();
            if (config?.onMoveSection && selectedIndex >= 0) {
                config.onMoveSection(items[selectedIndex]);
                tap();
            }
            break;

        case 'n':
            e.preventDefault();
            if (config?.onNewItem) {
                config.onNewItem();
                tap();
            }
            break;

        case 'Escape':
            e.preventDefault();
            clearSelection();
            if (config?.onEscape) {
                config.onEscape();
            }
            tap();
            break;

        case '1':
            e.preventDefault();
            if (config?.onSectionJump) {
                config.onSectionJump('inbox');
                tap();
            }
            break;

        case '2':
            e.preventDefault();
            if (config?.onSectionJump) {
                config.onSectionJump('next');
                tap();
            }
            break;

        case '3':
            e.preventDefault();
            if (config?.onSectionJump) {
                config.onSectionJump('shipToday');
                tap();
            }
            break;

        case '?':
            e.preventDefault();
            showKeyboardHelp();
            break;
    }
}

/**
 * Move selection up or down
 * @param {number} delta - Direction to move (1 or -1)
 */
function moveSelection(delta) {
    if (items.length === 0) return;

    // Clear previous selection
    if (items[selectedIndex]) {
        items[selectedIndex].classList.remove('keyboard-selected');
    }

    // Update index
    selectedIndex += delta;
    if (selectedIndex < 0) selectedIndex = items.length - 1;
    if (selectedIndex >= items.length) selectedIndex = 0;

    // Apply new selection
    const item = items[selectedIndex];
    if (item) {
        item.classList.add('keyboard-selected');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (config?.onMove) {
            config.onMove(item, selectedIndex);
        }
        tap();
    }
}

/**
 * Clear selection
 */
export function clearSelection() {
    if (items[selectedIndex]) {
        items[selectedIndex].classList.remove('keyboard-selected');
    }
    selectedIndex = -1;
}

/**
 * Show keyboard shortcuts help modal
 */
function showKeyboardHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'keyboard-help-modal';
    helpModal.innerHTML = `
        <div class="keyboard-help-content">
            <h3>⌨️ Keyboard Shortcuts</h3>
            <table>
                <tr><td><kbd>j</kbd> / <kbd>↓</kbd></td><td>Move down</td></tr>
                <tr><td><kbd>k</kbd> / <kbd>↑</kbd></td><td>Move up</td></tr>
                <tr><td><kbd>Enter</kbd></td><td>Edit item</td></tr>
                <tr><td><kbd>d</kbd></td><td>Delete item</td></tr>
                <tr><td><kbd>m</kbd></td><td>Move to section</td></tr>
                <tr><td><kbd>n</kbd></td><td>New item</td></tr>
                <tr><td><kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd></td><td>Jump to Inbox/Next/Ship</td></tr>
                <tr><td><kbd>Esc</kbd></td><td>Clear selection / Close</td></tr>
                <tr><td><kbd>?</kbd></td><td>Show this help</td></tr>
            </table>
            <button class="close-help">Close</button>
        </div>
    `;
    helpModal.querySelector('.close-help').addEventListener('click', () => {
        helpModal.remove();
    });
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.remove();
    });
    document.body.appendChild(helpModal);
}

/**
 * Cleanup keyboard listeners
 */
export function destroyKeyboard() {
    document.removeEventListener('keydown', handleKeyDown);
    config = null;
    items = [];
    selectedIndex = -1;
}

export default {
    initKeyboard,
    updateItems,
    getSelectedItem,
    clearSelection,
    destroyKeyboard
};
