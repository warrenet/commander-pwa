/**
 * UI Module for Commander PWA
 * Handles rendering, inline editing, and user interactions
 * @module ui
 */

import {
    getState,
    getSaveStatus,
    subscribe,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
    clearAll,
    undo,
    canUndo,
    importFromJSON,
} from './state.js';
import { downloadMarkdown, downloadJSON, parseImportedJSON } from './export.js';

// DOM Elements
let commanderEl;
let saveStatusEl;
let contextMenuEl;
let menuOverlayEl;
let confirmOverlayEl;
let confirmTitleEl;
let confirmMessageEl;
let importInputEl;

// State
let selectedItem = null;
let longPressTimeout = null;
let confirmCallback = null;

const LONG_PRESS_MS = 500;

const SECTION_CONFIG = {
    inbox: { icon: '📥', title: 'Inbox', className: 'section-inbox' },
    next: { icon: '📋', title: 'Next', className: 'section-next' },
    shipToday: { icon: '🚀', title: 'Ship Today', className: 'section-ship' },
};

/**
 * Initialize UI and bind event listeners
 */
export function initUI() {
    // Cache DOM elements
    commanderEl = document.getElementById('commander');
    saveStatusEl = document.getElementById('saveStatus');
    contextMenuEl = document.getElementById('contextMenu');
    menuOverlayEl = document.getElementById('menuOverlay');
    confirmOverlayEl = document.getElementById('confirmOverlay');
    confirmTitleEl = document.getElementById('confirmTitle');
    confirmMessageEl = document.getElementById('confirmMessage');
    importInputEl = document.getElementById('importInput');

    // Subscribe to state changes
    subscribe(render);

    // Bind action bar buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handleAction);
    });

    // Bind context menu buttons
    document.querySelectorAll('[data-move]').forEach(btn => {
        btn.addEventListener('click', handleMoveAction);
    });

    // Bind import file input
    importInputEl.addEventListener('change', handleImportFile);

    // Close menus on overlay click
    menuOverlayEl.addEventListener('click', (e) => {
        if (e.target === menuOverlayEl) closeMenu();
    });
    confirmOverlayEl.addEventListener('click', (e) => {
        if (e.target === confirmOverlayEl) closeConfirm();
    });

    // Initial render
    render(getState(), getSaveStatus());
}

/**
 * Render the full UI
 * @param {Object} state
 * @param {string} saveStatus
 */
function render(state, saveStatus) {
    // Update save status indicator
    updateSaveStatus(saveStatus);

    // Check if an item is currently being edited (has focus)
    const activeElement = document.activeElement;
    const isEditing = activeElement && activeElement.classList.contains('item-content');
    const editingItemId = isEditing ? activeElement.closest('.item')?.dataset?.id : null;
    const editingSection = isEditing ? activeElement.closest('.item')?.dataset?.section : null;

    // If we're editing, only update the section counts, don't rebuild DOM
    if (isEditing && editingItemId) {
        // Just update section counts
        ['inbox', 'next', 'shipToday'].forEach(section => {
            const countEl = document.querySelector(`[data-section="${section}"] .section-count`);
            if (countEl) {
                countEl.textContent = state[section].length;
            }
        });
        return;
    }

    // Full render when not editing
    commanderEl.innerHTML = '';

    ['inbox', 'next', 'shipToday'].forEach(section => {
        const sectionEl = renderSection(section, state[section]);
        commanderEl.appendChild(sectionEl);
    });
}

/**
 * Update the save status indicator
 * @param {string} status
 */
function updateSaveStatus(status) {
    saveStatusEl.className = 'status-indicator';

    switch (status) {
        case 'saving':
            saveStatusEl.textContent = 'Saving…';
            saveStatusEl.classList.add('saving');
            break;
        case 'saved':
            saveStatusEl.textContent = 'Saved ✓';
            saveStatusEl.classList.add('saved');
            break;
        case 'error':
            saveStatusEl.textContent = 'Error!';
            saveStatusEl.classList.add('error');
            break;
        default:
            saveStatusEl.textContent = 'Ready';
    }
}

/**
 * Render a section
 * @param {string} sectionKey
 * @param {Array} items
 * @returns {HTMLElement}
 */
function renderSection(sectionKey, items) {
    const config = SECTION_CONFIG[sectionKey];

    const section = document.createElement('section');
    section.className = `section ${config.className}`;
    section.dataset.section = sectionKey;

    // Header
    const header = document.createElement('header');
    header.className = 'section-header';
    header.innerHTML = `
    <span class="section-icon">${config.icon}</span>
    <h2 class="section-title">${config.title}</h2>
    <span class="section-count">${items.length}</span>
  `;
    section.appendChild(header);

    // List
    const list = document.createElement('ul');
    list.className = 'section-list';

    if (items.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'section-empty';
        empty.textContent = 'No items';
        list.appendChild(empty);
    } else {
        items.forEach(item => {
            const itemEl = renderItem(sectionKey, item);
            list.appendChild(itemEl);
        });
    }

    section.appendChild(list);
    return section;
}

/**
 * Render a single item
 * @param {string} section
 * @param {{ id: string, text: string }} item
 * @returns {HTMLElement}
 */
function renderItem(section, item) {
    const li = document.createElement('li');
    li.className = 'item';
    li.dataset.id = item.id;
    li.dataset.section = section;

    // Bullet
    const bullet = document.createElement('span');
    bullet.className = 'item-bullet';
    li.appendChild(bullet);

    // Content (editable)
    const content = document.createElement('div');
    content.className = 'item-content';
    content.contentEditable = 'true';
    content.spellcheck = true;
    content.textContent = item.text;

    // Handle text input
    content.addEventListener('input', () => {
        updateItem(section, item.id, content.textContent);
    });

    // Handle blur - normalize content
    content.addEventListener('blur', () => {
        // Trim and normalize
        const text = content.textContent.trim();
        if (text !== item.text) {
            updateItem(section, item.id, text);
        }
    });

    // Handle enter - create new item
    content.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const newId = addItem(section, '');
            // Focus new item after render
            requestAnimationFrame(() => {
                const newEl = document.querySelector(`[data-id="${newId}"] .item-content`);
                if (newEl) newEl.focus();
            });
        }
        // Delete empty item on backspace
        if (e.key === 'Backspace' && content.textContent === '') {
            e.preventDefault();
            deleteItem(section, item.id);
        }
    });

    li.appendChild(content);

    // Long press handling
    let pressStartTime = 0;

    const startLongPress = (e) => {
        pressStartTime = Date.now();
        li.classList.add('long-pressing');

        longPressTimeout = setTimeout(() => {
            // Trigger context menu
            li.classList.remove('long-pressing');
            showContextMenu(section, item.id);
        }, LONG_PRESS_MS);
    };

    const cancelLongPress = () => {
        li.classList.remove('long-pressing');
        if (longPressTimeout) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
        }
    };

    // Touch events
    li.addEventListener('touchstart', startLongPress, { passive: true });
    li.addEventListener('touchend', cancelLongPress);
    li.addEventListener('touchcancel', cancelLongPress);
    li.addEventListener('touchmove', cancelLongPress);

    // Mouse events for desktop testing
    li.addEventListener('mousedown', (e) => {
        if (e.button === 0) startLongPress(e);
    });
    li.addEventListener('mouseup', cancelLongPress);
    li.addEventListener('mouseleave', cancelLongPress);

    return li;
}

/**
 * Show context menu for an item
 * @param {string} section
 * @param {string} id
 */
function showContextMenu(section, id) {
    selectedItem = { section, id };

    // Hide the "Move to" button for current section
    document.querySelectorAll('[data-move]').forEach(btn => {
        btn.hidden = btn.dataset.move === section;
    });

    contextMenuEl.hidden = false;

    // Vibrate for haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

/**
 * Hide context menu
 */
function hideContextMenu() {
    contextMenuEl.hidden = true;
    selectedItem = null;
}

/**
 * Handle move action from context menu
 * @param {Event} e
 */
function handleMoveAction(e) {
    const toSection = e.currentTarget.dataset.move;

    if (selectedItem) {
        moveItem(selectedItem.section, toSection, selectedItem.id);
    }

    hideContextMenu();
}

/**
 * Handle action buttons
 * @param {Event} e
 */
function handleAction(e) {
    const action = e.currentTarget.dataset.action;

    switch (action) {
        case 'add-inbox':
            addItemAndFocus('inbox');
            break;
        case 'add-next':
            addItemAndFocus('next');
            break;
        case 'add-ship':
            addItemAndFocus('shipToday');
            break;
        case 'menu':
            openMenu();
            break;
        case 'close-menu':
            closeMenu();
            break;
        case 'export-md':
            downloadMarkdown();
            closeMenu();
            break;
        case 'export-json':
            downloadJSON();
            closeMenu();
            break;
        case 'import-json':
            importInputEl.click();
            break;
        case 'undo':
            if (canUndo()) {
                undo();
                closeMenu();
            } else {
                alert('Nothing to undo');
            }
            break;
        case 'clear-all':
            showConfirm(
                'Clear All?',
                'This will delete all items in all sections. This cannot be undone.',
                () => {
                    clearAll();
                    closeConfirm();
                    closeMenu();
                }
            );
            break;
        case 'delete':
            if (selectedItem) {
                deleteItem(selectedItem.section, selectedItem.id);
                hideContextMenu();
            }
            break;
        case 'cancel':
            hideContextMenu();
            break;
        case 'confirm-cancel':
            closeConfirm();
            break;
        case 'confirm-yes':
            if (confirmCallback) {
                confirmCallback();
            }
            break;
    }
}

/**
 * Add an item and focus it
 * @param {string} section
 */
function addItemAndFocus(section) {
    const id = addItem(section, '');

    // Focus new item after render
    requestAnimationFrame(() => {
        const newEl = document.querySelector(`[data-id="${id}"] .item-content`);
        if (newEl) {
            newEl.focus();
            // Scroll into view
            newEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

/**
 * Open menu modal
 */
function openMenu() {
    menuOverlayEl.hidden = false;
}

/**
 * Close menu modal
 */
function closeMenu() {
    menuOverlayEl.hidden = true;
}

/**
 * Show confirmation dialog
 * @param {string} title
 * @param {string} message
 * @param {Function} callback
 */
function showConfirm(title, message, callback) {
    confirmTitleEl.textContent = title;
    confirmMessageEl.textContent = message;
    confirmCallback = callback;
    confirmOverlayEl.hidden = false;
}

/**
 * Close confirmation dialog
 */
function closeConfirm() {
    confirmOverlayEl.hidden = true;
    confirmCallback = null;
}

/**
 * Handle import file selection
 * @param {Event} e
 */
async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = parseImportedJSON(text);

        showConfirm(
            'Replace All Data?',
            'This will replace all current items with the imported data. Continue?',
            async () => {
                await importFromJSON(data);
                closeConfirm();
                closeMenu();
            }
        );
    } catch (err) {
        alert(`Import failed: ${err.message}`);
    }

    // Reset input
    e.target.value = '';
}
