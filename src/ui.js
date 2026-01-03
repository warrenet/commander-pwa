/**
 * UI Module for Commander PWA
 * Handles rendering, inline editing, and user interactions
 * @module ui
 */

import {
    getState,
    getSaveStatus,
    getCurrentView,
    setCurrentView,
    subscribe,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
    clearAll,
    undo,
    canUndo,
    importFromJSON,
    addLog,
    deleteLog,
    getLogs,
    searchLogs,
    markShipped,
    getTodayShipped,
    importMerged,
    checkOfflineReady,
} from './state.js';
import { downloadMarkdown, downloadJSON, parseImportedJSON, downloadBackup, parseBackupWithMerge } from './export.js';
import { getTemplateList, getFilledTemplate } from './templates.js';

// DOM Elements
let commanderEl;
let captureViewEl;
let saveStatusEl;
let contextMenuEl;
let logContextMenuEl;
let menuOverlayEl;
let confirmOverlayEl;
let confirmTitleEl;
let confirmMessageEl;
let importInputEl;
let captureTextareaEl;
let pasteBtnEl;
let saveLogBtnEl;
let routeSelectEl;
let logsSearchEl;
let logsListEl;
let logsCountEl;

// State
let selectedItem = null;
let selectedLog = null;
let longPressTimeout = null;
let confirmCallback = null;
let searchQuery = '';
let shipItem = null; // Item being shipped

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
    captureViewEl = document.getElementById('captureView');
    saveStatusEl = document.getElementById('saveStatus');
    contextMenuEl = document.getElementById('contextMenu');
    logContextMenuEl = document.getElementById('logContextMenu');
    menuOverlayEl = document.getElementById('menuOverlay');
    confirmOverlayEl = document.getElementById('confirmOverlay');
    confirmTitleEl = document.getElementById('confirmTitle');
    confirmMessageEl = document.getElementById('confirmMessage');
    importInputEl = document.getElementById('importInput');
    captureTextareaEl = document.getElementById('captureTextarea');
    pasteBtnEl = document.getElementById('pasteBtn');
    saveLogBtnEl = document.getElementById('saveLogBtn');
    routeSelectEl = document.getElementById('routeSelect');
    logsSearchEl = document.getElementById('logsSearch');
    logsListEl = document.getElementById('logsList');
    logsCountEl = document.getElementById('logsCount');

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

    // Bind log context menu buttons
    document.querySelectorAll('[data-log-action]').forEach(btn => {
        btn.addEventListener('click', handleLogAction);
    });

    // Bind import file input
    importInputEl.addEventListener('change', handleImportFile);

    // Bind capture buttons
    pasteBtnEl.addEventListener('click', handlePaste);
    saveLogBtnEl.addEventListener('click', handleSaveLog);

    // Bind search input
    logsSearchEl.addEventListener('input', handleSearchInput);

    // Bind template button
    const templateBtn = document.getElementById('templateBtn');
    if (templateBtn) templateBtn.addEventListener('click', openTemplateModal);

    // Bind restore file input
    const restoreInput = document.getElementById('restoreInput');
    if (restoreInput) restoreInput.addEventListener('change', handleRestoreFile);

    // Bind ship/template modal overlays
    const shipOverlay = document.getElementById('shipOverlay');
    if (shipOverlay) {
        shipOverlay.addEventListener('click', (e) => {
            if (e.target === shipOverlay) closeShipModal();
        });
    }
    const templateOverlay = document.getElementById('templateOverlay');
    if (templateOverlay) {
        templateOverlay.addEventListener('click', (e) => {
            if (e.target === templateOverlay) closeTemplateModal();
        });
    }

    // Close menus on overlay click
    menuOverlayEl.addEventListener('click', (e) => {
        if (e.target === menuOverlayEl) closeMenu();
    });
    confirmOverlayEl.addEventListener('click', (e) => {
        if (e.target === confirmOverlayEl) closeConfirm();
    });

    // Check offline ready and update indicator
    checkOfflineReady().then(ready => {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator && ready) indicator.hidden = false;
    });

    // Initial render
    render(getState(), getSaveStatus(), getCurrentView());
}

/**
 * Render the full UI
 * @param {Object} state
 * @param {string} saveStatus
 * @param {string} currentView
 */
function render(state, saveStatus, currentView) {
    // Update save status indicator
    updateSaveStatus(saveStatus);

    // Update tab buttons
    updateTabButtons(currentView);

    // Update today shipped count
    updateTodayShipped();

    // Show/hide views
    if (currentView === 'capture') {
        commanderEl.hidden = true;
        captureViewEl.hidden = false;
        renderLogsView(state);
    } else {
        commanderEl.hidden = false;
        captureViewEl.hidden = true;
        renderTasksView(state);
    }
}

/**
 * Update tab button active states
 * @param {string} currentView
 */
function updateTabButtons(currentView) {
    document.querySelectorAll('.action-btn-tab').forEach(btn => {
        const action = btn.dataset.action;
        if (action === 'view-tasks') {
            btn.classList.toggle('active', currentView === 'tasks');
        } else if (action === 'view-capture') {
            btn.classList.toggle('active', currentView === 'capture');
        }
    });
}

/**
 * Render the tasks view
 * @param {Object} state
 */
function renderTasksView(state) {
    // Check if an item is currently being edited (has focus)
    const activeElement = document.activeElement;
    const isEditing = activeElement && activeElement.classList.contains('item-content');
    const editingItemId = isEditing ? activeElement.closest('.item')?.dataset?.id : null;

    // If we're editing, only update the section counts, don't rebuild DOM
    if (isEditing && editingItemId) {
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
 * Render the logs/capture view
 * @param {Object} state
 */
function renderLogsView(state) {
    const logs = searchQuery ? searchLogs(searchQuery) : (state.logs || []);

    // Update count
    logsCountEl.textContent = logs.length;

    // Render logs list
    logsListEl.innerHTML = '';

    if (logs.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'logs-empty';
        empty.textContent = searchQuery ? 'No logs match your search' : 'No logs yet. Capture something!';
        logsListEl.appendChild(empty);
    } else {
        logs.forEach(log => {
            const logEl = renderLogItem(log);
            logsListEl.appendChild(logEl);
        });
    }
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
            requestAnimationFrame(() => {
                const newEl = document.querySelector(`[data-id="${newId}"] .item-content`);
                if (newEl) newEl.focus();
            });
        }
        if (e.key === 'Backspace' && content.textContent === '') {
            e.preventDefault();
            deleteItem(section, item.id);
        }
    });

    li.appendChild(content);

    // Long press handling
    const startLongPress = () => {
        li.classList.add('long-pressing');
        longPressTimeout = setTimeout(() => {
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

    li.addEventListener('touchstart', startLongPress, { passive: true });
    li.addEventListener('touchend', cancelLongPress);
    li.addEventListener('touchcancel', cancelLongPress);
    li.addEventListener('touchmove', cancelLongPress);
    li.addEventListener('mousedown', (e) => {
        if (e.button === 0) startLongPress();
    });
    li.addEventListener('mouseup', cancelLongPress);
    li.addEventListener('mouseleave', cancelLongPress);

    return li;
}

/**
 * Render a log item
 * @param {Object} log
 * @returns {HTMLElement}
 */
function renderLogItem(log) {
    const li = document.createElement('li');
    li.className = 'log-item';
    li.dataset.logId = log.id;

    const date = new Date(log.createdAt).toLocaleString();
    const preview = log.content.length > 50
        ? log.content.substring(0, 50).replace(/\n/g, ' ') + '...'
        : log.content.replace(/\n/g, ' ');

    li.innerHTML = `
    <div class="log-item-header">
      <div class="log-item-meta">
        <span class="log-item-date">${date}</span>
        <span class="log-item-preview">${escapeHtml(preview)}</span>
      </div>
      <span class="log-item-source ${log.source === 'clipboard' ? 'clipboard' : ''}">${log.source}</span>
    </div>
    <div class="log-item-content">
      <div class="log-item-full-text">${escapeHtml(log.content)}</div>
    </div>
  `;

    // Toggle expand on click
    const header = li.querySelector('.log-item-header');
    header.addEventListener('click', () => {
        li.classList.toggle('expanded');
    });

    // Long press for context menu
    const startLongPress = () => {
        li.classList.add('long-pressing');
        longPressTimeout = setTimeout(() => {
            li.classList.remove('long-pressing');
            showLogContextMenu(log);
        }, LONG_PRESS_MS);
    };

    const cancelLongPress = () => {
        li.classList.remove('long-pressing');
        if (longPressTimeout) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
        }
    };

    header.addEventListener('touchstart', startLongPress, { passive: true });
    header.addEventListener('touchend', cancelLongPress);
    header.addEventListener('touchcancel', cancelLongPress);
    header.addEventListener('touchmove', cancelLongPress);

    return li;
}

/**
 * Escape HTML entities
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Handle paste button
 */
async function handlePaste() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            captureTextareaEl.value = text;
            captureTextareaEl.focus();
        }
    } catch (err) {
        // Clipboard API not available or permission denied
        alert('📋 Clipboard access not available.\n\nPlease use your keyboard to paste (long-press the textarea and select Paste).');
    }
}

/**
 * Handle save log button
 */
function handleSaveLog() {
    const content = captureTextareaEl.value.trim();
    if (!content) {
        alert('Nothing to save!');
        return;
    }

    const route = routeSelectEl.value;
    const source = 'manual';

    addLog(content, source, route, []);

    // Clear textarea
    captureTextareaEl.value = '';

    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

/**
 * Handle search input
 */
function handleSearchInput(e) {
    searchQuery = e.target.value;
    renderLogsView(getState());
}

/**
 * Show context menu for an item
 * @param {string} section
 * @param {string} id
 */
function showContextMenu(section, id) {
    selectedItem = { section, id };

    document.querySelectorAll('[data-move]').forEach(btn => {
        btn.hidden = btn.dataset.move === section;
    });

    contextMenuEl.hidden = false;

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
 * Show log context menu
 * @param {Object} log
 */
function showLogContextMenu(log) {
    selectedLog = log;
    logContextMenuEl.hidden = false;

    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

/**
 * Hide log context menu
 */
function hideLogContextMenu() {
    logContextMenuEl.hidden = true;
    selectedLog = null;
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
 * Handle log action from context menu
 * @param {Event} e
 */
function handleLogAction(e) {
    const action = e.currentTarget.dataset.logAction;

    if (!selectedLog) {
        hideLogContextMenu();
        return;
    }

    switch (action) {
        case 'copy':
            navigator.clipboard.writeText(selectedLog.content).then(() => {
                if (navigator.vibrate) navigator.vibrate(50);
            }).catch(() => {
                alert('Failed to copy');
            });
            break;
        case 'send-inbox':
            addItem('inbox', selectedLog.content);
            break;
        case 'send-ship':
            addItem('shipToday', selectedLog.content);
            break;
        case 'delete':
            deleteLog(selectedLog.id);
            break;
        case 'cancel':
            break;
    }

    hideLogContextMenu();
}

/**
 * Handle action buttons
 * @param {Event} e
 */
function handleAction(e) {
    const action = e.currentTarget.dataset.action;

    switch (action) {
        case 'view-tasks':
            setCurrentView('tasks');
            break;
        case 'view-capture':
            setCurrentView('capture');
            break;
        case 'add-inbox':
            if (getCurrentView() !== 'tasks') setCurrentView('tasks');
            addItemAndFocus('inbox');
            break;
        case 'add-next':
            if (getCurrentView() !== 'tasks') setCurrentView('tasks');
            addItemAndFocus('next');
            break;
        case 'add-ship':
            if (getCurrentView() !== 'tasks') setCurrentView('tasks');
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
        case 'mark-shipped':
            if (selectedItem) {
                openShipModal(selectedItem.section, selectedItem.id);
            }
            break;
        case 'confirm-cancel':
            closeConfirm();
            break;
        case 'confirm-yes':
            if (confirmCallback) {
                confirmCallback();
            }
            break;
        case 'backup':
            downloadBackup();
            closeMenu();
            break;
        case 'restore':
            document.getElementById('restoreInput')?.click();
            break;
        case 'view-shipped':
            showShippedItems();
            break;
        case 'close-ship':
        case 'cancel-ship':
            closeShipModal();
            break;
        case 'confirm-ship':
            handleConfirmShip();
            break;
        case 'close-template':
            closeTemplateModal();
            break;
    }
}

/**
 * Add an item and focus it
 * @param {string} section
 */
function addItemAndFocus(section) {
    const id = addItem(section, '');

    requestAnimationFrame(() => {
        const newEl = document.querySelector(`[data-id="${id}"] .item-content`);
        if (newEl) {
            newEl.focus();
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

    e.target.value = '';
}

/**
 * Update today shipped count
 */
function updateTodayShipped() {
    const el = document.getElementById('todayShipped');
    if (!el) return;

    const shipped = getTodayShipped();
    el.textContent = `${shipped.length} shipped`;
}

/**
 * Open ship modal for an item
 * @param {string} section
 * @param {string} id
 */
function openShipModal(section, id) {
    shipItem = { section, id };
    const overlay = document.getElementById('shipOverlay');
    if (overlay) overlay.hidden = false;

    // Clear fields
    const saveAsEl = document.getElementById('shipSaveAs');
    const dodEl = document.getElementById('shipDoD');
    if (saveAsEl) saveAsEl.value = '';
    if (dodEl) dodEl.value = '';
}

/**
 * Close ship modal
 */
function closeShipModal() {
    const overlay = document.getElementById('shipOverlay');
    if (overlay) overlay.hidden = true;
    shipItem = null;
}

/**
 * Handle confirm ship
 */
function handleConfirmShip() {
    if (!shipItem) return;

    const saveAs = document.getElementById('shipSaveAs')?.value?.trim();
    const dod = document.getElementById('shipDoD')?.value?.trim();

    if (!saveAs) {
        alert('Save As is required');
        return;
    }
    if (!dod) {
        alert('Definition of Done is required');
        return;
    }

    try {
        markShipped(shipItem.section, shipItem.id, saveAs, dod);
        closeShipModal();
        hideContextMenu();

        if (navigator.vibrate) navigator.vibrate(100);
    } catch (err) {
        alert(err.message);
    }
}

/**
 * Open template modal
 */
function openTemplateModal() {
    const overlay = document.getElementById('templateOverlay');
    const listEl = document.getElementById('templateList');
    if (!overlay || !listEl) return;

    // Render template options
    const templates = getTemplateList();
    listEl.innerHTML = '';

    templates.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'template-option';
        btn.innerHTML = `
      <span class="template-icon">${t.icon}</span>
      <div class="template-info">
        <div class="template-name">${t.name}</div>
        <div class="template-desc">${t.description}</div>
      </div>
    `;
        btn.addEventListener('click', () => {
            selectTemplate(t.key);
        });
        listEl.appendChild(btn);
    });

    overlay.hidden = false;
}

/**
 * Close template modal
 */
function closeTemplateModal() {
    const overlay = document.getElementById('templateOverlay');
    if (overlay) overlay.hidden = true;
}

/**
 * Select a template and fill the capture textarea
 * @param {string} templateKey
 */
function selectTemplate(templateKey) {
    const content = getFilledTemplate(templateKey, {});
    const textarea = document.getElementById('captureTextarea');
    if (textarea) {
        textarea.value = content;
        textarea.focus();
    }
    closeTemplateModal();
}

/**
 * Handle restore file selection
 * @param {Event} e
 */
async function handleRestoreFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        const result = parseBackupWithMerge(text, getState());

        showConfirm(
            'Merge Backup?',
            `Found ${result.stats.imported.inbox + result.stats.imported.next + result.stats.imported.shipToday} tasks and ${result.stats.imported.logs} logs to import. Duplicates will be skipped. Continue?`,
            async () => {
                await importMerged(result);
                closeConfirm();
                closeMenu();
                alert(`Imported: ${result.stats.imported.inbox} inbox, ${result.stats.imported.next} next, ${result.stats.imported.shipToday} ship, ${result.stats.imported.logs} logs`);
            }
        );
    } catch (err) {
        alert(`Restore failed: ${err.message}`);
    }

    e.target.value = '';
}

/**
 * Show shipped items in an alert (simple for v1.1)
 */
function showShippedItems() {
    const shipped = getTodayShipped();

    if (shipped.length === 0) {
        alert('No items shipped today yet!');
        return;
    }

    let msg = `Today's Shipped (${shipped.length}):\n\n`;
    shipped.forEach((item, i) => {
        msg += `${i + 1}. ${item.saveAs}\n   DoD: ${item.definitionOfDone}\n\n`;
    });

    alert(msg);
    closeMenu();
}

// Export openShipModal so context menu can use it
window.openShipModal = openShipModal;

