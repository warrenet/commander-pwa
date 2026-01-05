/**
 * UI Module for Commander PWA
 * Handles rendering, inline editing, and user interactions
 * @module ui
 */

import {
    getState, getSaveStatus, getCurrentView, setCurrentView, subscribe,
    addItem, updateItem, deleteItem, moveItem, clearAll,
    undo, canUndo, importFromJSON, addLog, deleteLog, getLogs, searchLogs,
    markShipped, getTodayShipped, importMerged, checkOfflineReady, clearLogs,
} from './state.js';
import { downloadMarkdown, downloadJSON, parseImportedJSON, downloadBackup, parseBackupWithMerge } from './export.js';
import { getTemplateList, getFilledTemplate, TEMPLATES } from './templates.js';
import { getDiagnostics, SCHEMA_VERSION } from './db.js';
import { getBoardSections, autoCategorize } from './smart-sorting.js';

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

// New DOM elements for template and capture
const menuCloseBtnEl = document.querySelector('[data-action="close-menu"]');
let quartermasterBtnEl = null;

// Quartermaster will be initialized in initUI

// Template elements
const templateBtnEl = document.getElementById('templateBtn');
const templateOverlayEl = document.getElementById('templateOverlay');
const templateListEl = document.getElementById('templateList');
const templateCloseBtnEl = document.querySelector('[data-action="close-template"]');

// State
let selectedItem = null;
let selectedLog = null;
let longPressTimeout = null;
let confirmCallback = null;
let searchQuery = '';
let tasksViewMode = 'list'; // 'list' or 'board'
let activeTagFilter = null; // Currently filtered tag
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

    // Initialize Quartermaster FAB
    quartermasterBtnEl = document.getElementById('quartermasterBtn');
    initQuartermaster();

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

    // Bind Template Button
    if (templateBtnEl) {
        templateBtnEl.addEventListener('click', openTemplateModal);
    }
    if (templateCloseBtnEl) {
        templateCloseBtnEl.addEventListener('click', closeTemplateModal);
    }

    // Bind Time Bandit
    const timerEl = document.getElementById('timeBandit');
    if (timerEl) {
        timerEl.addEventListener('click', handleTimeBandit);
    }

    // Bind Mic Button
    const micBtn = document.getElementById('micBtn');
    if (micBtn && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        micBtn.hidden = false;
        micBtn.addEventListener('click', handleVoiceCapture);
    }

    // Bind search input
    logsSearchEl.addEventListener('input', handleSearchInput);

    // Bind View Toggle
    const viewToggleBtn = document.getElementById('viewToggle');
    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', toggleTasksViewMode);
    }

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

    // Offline status monitoring
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    // Automation: Listen for commands
    window.addEventListener('commander-command', handleCommandEvent);

    // Initial check
    updateConnectionStatus();

    // Global keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Initial render
    render(getState(), getSaveStatus(), getCurrentView());

    // Check if first run
    checkFirstRun();
}

/**
 * Handle automation commands
 * @param {CustomEvent} e 
 */
function handleCommandEvent(e) {
    const { command, text, tags, priority, silent, view } = e.detail;

    // Set silent mode flag mechanism if needed for this session
    // For now we'll pass silent flag to actions where possible

    console.log('[UI] Received command:', command, e.detail);

    // Command Router
    switch (command) {
        case 'add-task':
        case 'add':
            if (text) {
                // Parse priority from valid values
                let finalTags = [...tags];
                let section = 'inbox'; // Default

                // Add priority tag if specified
                if (priority) {
                    finalTags.push(priority === 'high' ? '#priority' : `#${priority}`);
                }

                // Add item directly
                const id = addItem(section, text);

                // Add tags if any
                if (finalTags.length > 0) {
                    // Update item to append tags text or metadata
                    // System simple approach: append to text for now or implementation dependent
                    // But we have updateItem. Let's append tags to text if we don't have separate tag field in addItem yet
                    // The addItem only takes text. The tagger runs on text.
                    // So we should append tags to text.
                    const textWithTags = `${text} ${finalTags.join(' ')}`;
                    updateItem(section, id, textWithTags);
                }

                if (!silent) {
                    showToast(`Added: ${text}`, 'success');
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            }
            break;

        case 'log':
            if (text) {
                addLog(text, 'automation');
                if (!silent) showToast('Log added', 'info');
            }
            break;

        case 'toggle-theme':
            // Toggle theme class on body
            document.body.classList.toggle('theme-light');
            // Save preference if needed (not native yet but illustrative)
            if (!silent) showToast('Theme toggled', 'info');
            break;

        case 'focus-mode':
            if (!silent) showToast('Focus Mode activated', 'info');
            // Logic to set focus mode view would go here if/when focus.js is integrated fully to UI
            // For now, switch to shipToday
            setCurrentView('tasks');
            // We'd ideally toggle the focus utility
            break;

        case 'navigate':
            if (view) {
                setCurrentView(view);
            }
            break;
    }
}

/**
 * Update connection status indicator
 */
async function updateConnectionStatus() {
    const indicator = document.getElementById('offlineIndicator');
    if (!indicator) return;

    const isOffline = !navigator.onLine;

    if (isOffline) {
        indicator.textContent = '📡 Offline';
        indicator.className = 'offline-indicator offline';
        indicator.hidden = false;
    } else {
        // Check if SW is ready (PWA installed/cached)
        const ready = await checkOfflineReady();
        if (ready) {
            indicator.textContent = '🟢 Ready';
            indicator.className = 'offline-indicator'; // Default is green
            indicator.hidden = false;
        } else {
            indicator.hidden = true;
        }
    }
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

    // View Transitions API
    if (document.startViewTransition) {
        document.startViewTransition(() => {
            updateView(currentView, state);
        });
    } else {
        // Fallback for older browsers
        updateView(currentView, state);
    }
}

/**
 * Helper to actual update DOM for views
 */
function updateView(currentView, state) {
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
    if (tasksViewMode === 'board') {
        renderBoardView(state);
        return;
    }

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

    // Show filter indicator if active
    if (activeTagFilter) {
        const filterBar = document.createElement('div');
        filterBar.className = 'filter-bar';
        filterBar.innerHTML = `
            <span>Filtering: <strong>#${activeTagFilter}</strong></span>
            <button class="filter-clear-btn">✕ Clear</button>
        `;
        filterBar.querySelector('.filter-clear-btn').addEventListener('click', clearTagFilter);
        commanderEl.appendChild(filterBar);
    }

    ['inbox', 'next', 'shipToday'].forEach(section => {
        // Apply filter if active
        let items = state[section];
        if (activeTagFilter) {
            items = items.filter(item =>
                item.tags && item.tags.some(t =>
                    t.replace('#', '').toLowerCase() === activeTagFilter
                )
            );
        }
        const sectionEl = renderSection(section, items);
        commanderEl.appendChild(sectionEl);
    });
}

/**
 * Render the board view
 * @param {Object} state
 */
function renderBoardView(state) {
    commanderEl.innerHTML = '';

    // Aggregate items with source section
    const allItems = [
        ...state.inbox.map(i => ({ ...i, _section: 'inbox' })),
        ...state.next.map(i => ({ ...i, _section: 'next' })),
        ...state.shipToday.map(i => ({ ...i, _section: 'shipToday' }))
    ];

    const columns = getBoardSections(allItems);

    const container = document.createElement('div');
    container.className = 'board-container';

    columns.forEach(col => {
        const colEl = document.createElement('div');
        colEl.className = 'board-column';
        colEl.classList.add(`board-col-${col.id}`);

        colEl.innerHTML = `
            <div class="board-header">
                <span class="board-title">${col.title}</span>
                <span class="board-count">${col.items.length}</span>
            </div>
        `;

        const listEl = document.createElement('ul');
        listEl.className = 'board-items';

        col.items.forEach(item => {
            // Re-use renderItem but with the item's original section
            const itemEl = renderItem(item._section, item);
            itemEl.classList.add('board-card');
            listEl.appendChild(itemEl);
        });

        colEl.appendChild(listEl);
        container.appendChild(colEl);
    });

    commanderEl.appendChild(container);
}

/**
 * Toggle between List and Board view
 */
function toggleTasksViewMode() {
    tasksViewMode = tasksViewMode === 'list' ? 'board' : 'list';

    const btn = document.getElementById('viewToggle');
    if (btn) {
        btn.textContent = tasksViewMode === 'list' ? '📋' : '📊';
        btn.setAttribute('title', tasksViewMode === 'list' ? 'Switch to Smart Board' : 'Switch to List');
    }

    render(getState(), getSaveStatus(), 'tasks');
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

        const emptyStates = {
            inbox: { icon: '📥', text: 'Inbox empty — capture something!' },
            next: { icon: '🎯', text: 'Nothing queued up' },
            shipToday: { icon: '🚀', text: 'Ready to ship?' }
        };
        const state = emptyStates[sectionKey] || { icon: '📭', text: 'No items' };
        empty.innerHTML = `<span class="empty-icon">${state.icon}</span><span class="empty-text">${state.text}</span>`;
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

    // Tags (clickable)
    if (item.tags && item.tags.length > 0) {
        const tagsEl = document.createElement('div');
        tagsEl.className = 'item-tags';
        item.tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'item-tag';
            tagEl.textContent = tag.startsWith('#') ? tag : `#${tag}`;
            tagEl.addEventListener('click', (e) => {
                e.stopPropagation();
                filterByTag(tag);
            });
            tagsEl.appendChild(tagEl);
        });
        li.appendChild(tagsEl);
    }

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
 * Show a toast notification
 * @param {string} message
 * @param {'success' | 'error' | 'info' | 'warning'} [type='success']
 */
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;

    // Icon mapping
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    const icon = icons[type] || icons.success;
    toastEl.textContent = `${icon} ${message}`;
    toastEl.className = 'toast show toast-' + type;

    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(type === 'error' ? [50, 50, 50] : 50);
    }

    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

/**
 * Handle paste button
 */
async function handlePaste() {
    try {
        const text = await navigator.clipboard.readText();
        if (!text) return;

        // Smart Batch Paste Logic
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        // Detect bullet points: lines starting with -, *, or 1.
        const bulletRegex = /^(\-|\*|\d+\.)\s+/;
        const potentialItems = lines.filter(l => bulletRegex.test(l));

        if (potentialItems.length > 1) {
            const doSplit = confirm(`Detected ${potentialItems.length} list items. Split them into separate Inbox tasks?`);

            if (doSplit) {
                potentialItems.forEach(line => {
                    // Remove the bullet
                    const cleanText = line.replace(bulletRegex, '').trim();
                    if (cleanText) {
                        addItem('inbox', cleanText);
                    }
                });
                showToast(`✅ Added ${potentialItems.length} items to Inbox`);

                // Switch to tasks view to show result
                setCurrentView('tasks');

                // Vibrate
                if (navigator.vibrate) navigator.vibrate(50);
                return;
            }
        }

        // Standard paste
        captureTextareaEl.value = text;
        captureTextareaEl.focus();
    } catch (err) {
        console.error('Failed to read clipboard:', err);
        alert('Permission to read clipboard denied.');
    }
}

/**
 * Open Template Modal
 */
function openTemplateModal() {
    renderTemplateList();
    templateOverlayEl.hidden = false;
}

/**
 * Close Template Modal
 */
function closeTemplateModal() {
    templateOverlayEl.hidden = true;
}

/**
 * Render Template List
 */
function renderTemplateList() {
    const templates = getTemplateList();
    templateListEl.innerHTML = '';

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; gap: 12px; grid-template-columns: repeat(2, 1fr);';

    templates.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.style.cssText = 'height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center;';
        btn.innerHTML = `
            <span style="font-size: 24px;">${t.icon}</span>
            <span>${t.label}</span>
        `;
        btn.onclick = () => selectTemplate(t.id);
        grid.appendChild(btn);
    });

    templateListEl.appendChild(grid);
}

/**
 * Select a template
 * @param {string} id
 */
/**
 * Select a template
 * @param {string} id
 */
async function selectTemplate(id) {
    let options = {};

    // Ouroboros Link: Context Aware injection
    if (id === 'MissionControl') {
        const state = getState();
        const logs = state.logs || [];

        // Find last Nightly Delta
        const lastNightly = logs.find(l =>
            (l.tags && l.tags.includes('#nightly')) ||
            (l.saveAs && l.saveAs.includes('NightlyDelta'))
        );

        if (lastNightly) {
            // Extract "Tomorrow's Focus"
            // Look for "Tomorrow's Focus:" and capture lines after it until next header or end
            const match = lastNightly.content.match(/Tomorrow's Focus:([\s\S]*?)(?:###|$)/);
            if (match && match[1]) {
                const focusItems = match[1].trim()
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.startsWith('-'))
                    .map(line => line.replace(/^-\s*/, '').trim()) // Remove dash
                    .filter(line => line) // Remove empty
                    .map((item, i) => `${i + 1}. ${item}`) // Number them 1. 2. 3.
                    .join('\n');

                if (focusItems) {
                    options.previousFocus = focusItems;
                    showToast('🔗 Ouroboros Linked: Focus recovered', 'info');
                }
            }
        }
    }

    const content = getFilledTemplate(id, options);
    if (content) {
        captureTextareaEl.value = content;
        closeTemplateModal();
        captureTextareaEl.focus();
    }
}

/**
 * Handle voice capture
 */
function handleVoiceCapture() {
    const micBtn = document.getElementById('micBtn');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    // If already recording, stop
    if (micBtn.classList.contains('recording')) {
        // The 'end' event will clean up
        if (window.recognitionInstance) {
            window.recognitionInstance.stop();
        }
        return;
    }

    // Start recording
    const recognition = new SpeechRecognition();
    window.recognitionInstance = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Visual feedback
    micBtn.classList.add('recording');

    // Store original placeholder
    const originalPlaceholder = captureTextareaEl.getAttribute('placeholder');
    captureTextareaEl.setAttribute('placeholder', 'Listening...');

    // Handling results
    let startValue = captureTextareaEl.value;
    if (startValue && !startValue.endsWith(' ')) startValue += ' ';
    let finalTranscript = '';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
            currentTranscript += event.results[i][0].transcript;
        }

        // Protocol Droid Logic (Voice Templates)
        const protocolRegex = /^(?:protocol|template)\s+(\w+)(?:\s+(.*))?/i;
        const match = finalTranscript.trim().match(protocolRegex);

        if (match) {
            const templateKey = match[1].toLowerCase();
            const restContent = match[2] || '';

            const templates = getTemplateList();
            const template = templates.find(t =>
                t.id === templateKey || t.label.toLowerCase().includes(templateKey)
            );

            if (template) {
                let filled = template.content;
                if (restContent) {
                    if (filled.includes('Context:')) {
                        filled = filled.replace('Context: ', `Context: ${restContent}`);
                    } else if (filled.includes('Goal:')) {
                        filled = filled.replace('Goal: ', `Goal: ${restContent}`);
                    } else {
                        filled += `\n${restContent}`;
                    }
                }

                captureTextareaEl.value = filled;
                showToast(`🤖 Protocol Droid: Loaded ${template.label}`);
                captureTextareaEl.scrollTop = captureTextareaEl.scrollHeight;

                // Reset/stop to prevent overwriting
                micBtn.classList.remove('recording');
                window.recognitionInstance.stop();
                return;
            }
        }

        captureTextareaEl.value = startValue + currentTranscript;
        captureTextareaEl.scrollTop = captureTextareaEl.scrollHeight;
    };


    recognition.onend = () => {
        micBtn.classList.remove('recording');
        captureTextareaEl.setAttribute('placeholder', originalPlaceholder);
        window.recognitionInstance = null;

        // Vibrate to signal end
        if (navigator.vibrate) navigator.vibrate(50);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        micBtn.classList.remove('recording');
        captureTextareaEl.setAttribute('placeholder', originalPlaceholder);
    };

    recognition.start();
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

    // Auto-categorize manual entries
    const { tags } = autoCategorize(content);

    addLog(content, source, route, tags);

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
        case 'diagnostics':
            openDiagnostics();
            break;
        case 'close-diag':
            closeDiagnostics();
            break;
        case 'weekly-export':
            exportWeeklyForAI();
            break;
        case 'check-update':
            checkForUpdate();
            break;
        case 'reset-cache':
            resetCache();
            break;
        case 'export-debug':
            exportDebugBundle();
            break;
        case 'ai-setup':
            closeMenu();
            window.location.href = './ai-setup.html';
            break;
        case 'automations':
            closeMenu();
            window.location.href = './automations.html';
            break;
        case 'onboarding':
            closeMenu();
            showOnboarding();
            break;
        case 'close-onboarding':
            closeOnboarding();
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

// App version (injected at build time)
const APP_VERSION = typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : 'dev';

/**
 * Initialize Quartermaster FAB (Context Intelligence)
 */
function initQuartermaster() {
    if (!quartermasterBtnEl) return;

    function updateQuartermaster() {
        const hour = new Date().getHours();
        const day = new Date().getDay(); // 0 = Sunday
        let label = '';
        let icon = '';
        let action = '';

        // Logic: Sunday Evening, Morning (5-10), Night (18-5), Day (default)
        if (day === 0 && hour >= 18) {
            label = 'Weekly Review';
            icon = '🗓️';
            action = 'WeeklyReview';
        } else if (hour >= 5 && hour < 10) {
            label = 'Plan Day';
            icon = '☀️';
            action = 'MissionControl';
        } else if (hour >= 18 || hour < 5) {
            label = 'Debrief';
            icon = '🌙';
            action = 'NightlyDelta';
        } else {
            label = 'Quick Capture';
            icon = '⚡';
            action = 'capture';
        }

        quartermasterBtnEl.querySelector('.label').textContent = label;
        quartermasterBtnEl.querySelector('.icon').textContent = icon;
        quartermasterBtnEl.dataset.action = action;
        quartermasterBtnEl.hidden = false;
    }

    // Initial update
    updateQuartermaster();

    // Update on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateQuartermaster();
        }
    });

    // Click handler
    quartermasterBtnEl.addEventListener('click', () => {
        const action = quartermasterBtnEl.dataset.action;
        if (navigator.vibrate) navigator.vibrate(50);

        if (action === 'capture') {
            setCurrentView('capture');
            captureTextareaEl.focus();
        } else {
            selectTemplate(action);
        }
    });
}

/**
 * Open diagnostics modal
 */
async function openDiagnostics() {
    const overlay = document.getElementById('diagOverlay');
    if (!overlay) return;

    // Get diagnostics
    const diag = await getDiagnostics();

    document.getElementById('diagVersion').textContent = APP_VERSION.split('T')[0] || 'dev';
    document.getElementById('diagSchema').textContent = `v${diag.schemaVersion || 'unknown'}`;
    document.getElementById('diagUpdated').textContent = diag.lastUpdated?.split('T')[0] || 'never';

    const counts = diag.itemCounts || {};
    document.getElementById('diagCounts').textContent =
        `${counts.inbox || 0} inbox, ${counts.next || 0} next, ${counts.logs || 0} logs`;

    // Check SW status
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            document.getElementById('diagSW').textContent = reg.active ? '🟢 Active' : '🟡 Waiting';
        }).catch(() => {
            document.getElementById('diagSW').textContent = '🔴 Error';
        });
    } else {
        document.getElementById('diagSW').textContent = '⚪ Not supported';
    }

    overlay.hidden = false;
    closeMenu();
}

/**
 * Close diagnostics modal
 */
function closeDiagnostics() {
    const overlay = document.getElementById('diagOverlay');
    if (overlay) overlay.hidden = true;
}

/**
 * Export last 7 days logs for AI consumption
 */
function exportWeeklyForAI() {
    const state = getState();
    const logs = state.logs || [];

    // Get logs from last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentLogs = logs.filter(log => {
        const created = new Date(log.createdAt);
        return created >= weekAgo;
    });

    if (recentLogs.length === 0) {
        alert('No logs from the past 7 days.');
        return;
    }

    // Format for AI consumption
    let output = `# Commander Weekly Export\n`;
    output += `Exported: ${new Date().toISOString()}\n`;
    output += `Period: Last 7 days (${recentLogs.length} entries)\n\n`;
    output += `---\n\n`;

    recentLogs.forEach(log => {
        const date = new Date(log.createdAt).toLocaleString();
        const category = log.category || 'Note';
        output += `## [${category}] ${log.saveAs || 'Untitled'} — ${date}\n\n`;
        output += log.content + '\n\n';
        output += `---\n\n`;
    });

    // Copy to clipboard
    navigator.clipboard.writeText(output).then(() => {
        alert(`Copied ${recentLogs.length} logs to clipboard!\n\nPaste into ChatGPT for analysis.`);
        closeMenu();
    }).catch(() => {
        // Fallback: download as file
        const blob = new Blob([output], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commander-weekly-${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
        closeMenu();
    });
}

/**
 * Check for service worker update
 */
async function checkForUpdate() {
    if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.update();
        alert('Update check complete. If an update is available, it will install automatically.');
    } else {
        alert('Service workers not supported.');
    }
}

/**
 * Reset cache (last resort)
 */
async function resetCache() {
    if (!confirm('This will clear cached files. Your data will NOT be lost. Continue?')) {
        return;
    }

    try {
        if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(n => caches.delete(n)));
        }
        showToast('Cache cleared. Reloading...', 'info');
        setTimeout(() => location.reload(true), 500);
    } catch (err) {
        alert('Failed to clear cache: ' + err.message);
    }
}

/**
 * Nuke database (full reset - use with extreme caution)
 */
function nukeDatabase() {
    if (!confirm('⚠️ WARNING: This will DELETE ALL DATA. This cannot be undone. Continue?')) {
        return;
    }
    if (!confirm('Are you absolutely sure? This is irreversible.')) {
        return;
    }

    window.indexedDB.deleteDatabase('CommanderDB');
    showToast('Database nuked. Reloading...', 'info');
    setTimeout(() => location.reload(true), 500);
}

/**
 * Export debug bundle (sanitized diagnostics)
 */
async function exportDebugBundle() {
    const diag = await getDiagnostics();

    const bundle = {
        exportedAt: new Date().toISOString(),
        appVersion: APP_VERSION,
        schemaVersion: SCHEMA_VERSION,
        diagnostics: diag,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        serviceWorker: 'serviceWorker' in navigator,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commander-debug-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);


    closeDiagnostics();
}

// Auto-inject debug/debrief buttons on load
(function injectExtraButtons() {
    // Wait for DOM
    setTimeout(() => {
        const menuBody = document.querySelector('#menuOverlay .modal-body');
        if (menuBody && !document.getElementById('dailyDebriefBtn')) {
            const weeklyBtn = document.querySelector('[data-action="weekly-export"]');
            if (weeklyBtn) {
                const btn = document.createElement('button');
                btn.id = 'dailyDebriefBtn';
                btn.className = 'menu-btn';
                btn.innerHTML = '🧠 Copy Daily Debrief';
                btn.onclick = copyDailyDebrief;
                menuBody.insertBefore(btn, weeklyBtn);
            }
        }
    }, 1000);
})();

/**
 * THE TIME BANDIT
 * Focus Timer logic
 */
let banditInterval = null;
let banditTimeRemaining = 0;
let banditTotalTime = 0;

function handleTimeBandit() {
    if (banditInterval) {
        if (confirm('Cancel current session?')) {
            clearInterval(banditInterval);
            banditInterval = null;
            renderTimer(null);
        }
        return;
    }

    const minutes = prompt('Set Focus Timer (minutes):', '25');
    if (!minutes) return;

    const duration = parseInt(minutes);
    if (isNaN(duration) || duration <= 0) return;

    startBandit(duration);
}

function startBandit(minutes) {
    banditTotalTime = minutes;
    banditTimeRemaining = minutes * 60;

    renderTimer(banditTimeRemaining);

    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    showToast(`⏳ Focus: ${minutes}m started`);

    banditInterval = setInterval(() => {
        banditTimeRemaining--;
        renderTimer(banditTimeRemaining);

        if (banditTimeRemaining <= 0) {
            finishBandit();
        }
    }, 1000);
}

function finishBandit() {
    clearInterval(banditInterval);
    banditInterval = null;
    renderTimer(null);

    addLog(`✅ Focus Session: ${banditTotalTime}m completed`, 'auto', 'logs', ['#focus']);

    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
    alert(`Time's Up! ${banditTotalTime}m Session Logged.`);
}

function renderTimer(seconds) {
    const el = document.getElementById('timeBandit');
    if (!el) return;

    if (seconds === null) {
        el.textContent = '⏳';
        el.classList.remove('active');
        return;
    }

    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    el.classList.add('active');
}

/**
 * DAILY DEBRIEF
 * Copies logs + prompt for AI
 */
async function copyDailyDebrief() {
    const logs = getLogs();

    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = logs.filter(l => l.createdAt.startsWith(today));

    if (todaysLogs.length === 0) {
        showToast('No logs for today.');
        return;
    }

    const logText = todaysLogs.map(l =>
        `- [${new Date(l.createdAt).toLocaleTimeString()}] ${l.content}`
    ).join('\n');

    const prompt = `DATE: ${today}
LOGS:
${logText}

PROMPT:
Analyze my day based on these execution logs.
1. What was the highest leverage task?
2. Where was the friction or wasted time?
3. Grade my execution (A-F) with a short explanation.
4. Suggest one improvement for tomorrow.`;

    try {
        await navigator.clipboard.writeText(prompt);
        showToast('🧠 Debrief Prompt copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy', err);
        showToast('Failed to copy.');
    }
}


/**
 * Handle global keyboard shortcuts
 * @param {KeyboardEvent} e
 */
function handleKeyboardShortcuts(e) {
    // Ignore if typing in an input/textarea
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
        // Still handle Escape to blur
        if (e.key === 'Escape') {
            e.target.blur();
        }
        return;
    }

    // Escape - close any open modal/menu
    if (e.key === 'Escape') {
        closeMenu();
        closeConfirm();
        closeContextMenu();
        closeShipModal();
        closeTemplateModal();
        return;
    }

    // n - New capture (go to capture view)
    if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setCurrentView('capture');
        setTimeout(() => captureTextareaEl?.focus(), 100);
        showToast('New capture', 'info');
        return;
    }

    // 1, 2, 3 - Scroll to section
    if (e.key === '1') {
        scrollToSection('inbox');
        showToast('📥 Inbox', 'info');
        return;
    }
    if (e.key === '2') {
        scrollToSection('next');
        showToast('📋 Next', 'info');
        return;
    }
    if (e.key === '3') {
        scrollToSection('shipToday');
        showToast('🚀 Ship Today', 'info');
        return;
    }

    // ? or h - Show help
    if (e.key === '?' || e.key === 'h') {
        showToast('Shortcuts: n=new, 1/2/3=sections, Esc=close', 'info');
        return;
    }

    // b - Toggle board view
    if (e.key === 'b' || e.key === 'B') {
        toggleTasksViewMode();
        return;
    }
}

/**
 * Scroll to a specific section
 */
function scrollToSection(sectionKey) {
    const section = document.querySelector(`[data-section="${sectionKey}"]`);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Filter items by tag
 */
function filterByTag(tag) {
    const normalizedTag = tag.replace('#', '').toLowerCase();
    activeTagFilter = normalizedTag;
    showToast(`Filtering: #${normalizedTag}`, 'info');
    render(getState(), getSaveStatus(), 'tasks');
}

/**
 * Clear tag filter
 */
function clearTagFilter() {
    activeTagFilter = null;
    showToast('Filter cleared');
    render(getState(), getSaveStatus(), 'tasks');
}

/**
 * Show onboarding modal
 */
function showOnboarding() {
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) {
        overlay.hidden = false;
    }
}

/**
 * Close onboarding modal
 */
function closeOnboarding() {
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) {
        overlay.hidden = true;
    }
    // Mark as seen
    localStorage.setItem('commander-onboarded', 'true');
}

/**
 * Check if first run and show onboarding
 */
function checkFirstRun() {
    const seen = localStorage.getItem('commander-onboarded');
    if (!seen) {
        showOnboarding();
    }
}

// Run first-run check
checkFirstRun();
