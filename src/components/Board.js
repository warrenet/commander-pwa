/**
 * Board Component (CORE-02)
 * Renders Kanban-style board view of tasks
 * @module components/Board
 */

import { getBoardSections } from '../smart-sorting.js';

/**
 * Render a board view into a container element
 * @param {HTMLElement} container - The container to render into
 * @param {Object} state - The state object with inbox, next, shipToday arrays
 * @param {Function} renderItem - Function to render individual items
 */
export function renderBoard(container, state, renderItem) {
    container.innerHTML = '';

    // Aggregate items with source section
    const allItems = [
        ...state.inbox.map(i => ({ ...i, _section: 'inbox' })),
        ...state.next.map(i => ({ ...i, _section: 'next' })),
        ...state.shipToday.map(i => ({ ...i, _section: 'shipToday' }))
    ];

    const columns = getBoardSections(allItems);

    const boardContainer = document.createElement('div');
    boardContainer.className = 'board-container';

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
            // Re-use renderItem with the item's original section
            const itemEl = renderItem(item._section, item);
            itemEl.classList.add('board-card');
            listEl.appendChild(itemEl);
        });

        colEl.appendChild(listEl);
        boardContainer.appendChild(colEl);
    });

    container.appendChild(boardContainer);
}

/**
 * Get board column configuration
 * @returns {Array<{id: string, title: string}>}
 */
export function getBoardConfig() {
    return [
        { id: 'inbox', title: '📥 Inbox' },
        { id: 'next', title: '📋 Next' },
        { id: 'ship', title: '🚀 Ship Today' }
    ];
}

export default {
    renderBoard,
    getBoardConfig
};
