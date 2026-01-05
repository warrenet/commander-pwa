/**
 * List Component (CORE-02)
 * Renders list/section view of tasks
 * @module components/List
 */

/**
 * Section configuration
 */
const SECTION_CONFIG = {
    inbox: { icon: '📥', title: 'Inbox', className: 'section-inbox' },
    next: { icon: '📋', title: 'Next', className: 'section-next' },
    shipToday: { icon: '🚀', title: 'Ship Today', className: 'section-ship' }
};

/**
 * Render a section header + items
 * @param {string} sectionKey - The section key (inbox, next, shipToday)
 * @param {Array} items - The items in this section
 * @param {Function} renderItem - Function to render individual items
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.collapsed] - Whether section is collapsed
 * @returns {HTMLElement}
 */
export function renderSection(sectionKey, items, renderItem, options = {}) {
    const config = SECTION_CONFIG[sectionKey];
    if (!config) {
        console.warn(`Unknown section: ${sectionKey}`);
        return document.createElement('div');
    }

    const section = document.createElement('section');
    section.className = `section ${config.className}`;
    section.dataset.section = sectionKey;

    // Section header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
        <span class="section-icon">${config.icon}</span>
        <h2 class="section-title">${config.title}</h2>
        <span class="section-count">${items.length}</span>
    `;

    section.appendChild(header);

    // Items list
    const list = document.createElement('ul');
    list.className = 'section-items';

    if (items.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `<span class="empty-icon">✨</span><span>Empty</span>`;
        list.appendChild(emptyState);
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
 * Render the full list view
 * @param {HTMLElement} container - The container to render into
 * @param {Object} state - The state object with inbox, next, shipToday arrays
 * @param {Function} renderItem - Function to render individual items
 * @param {Object} [options] - Additional options
 * @param {string|null} [options.activeFilter] - Active tag filter
 * @param {Function} [options.onClearFilter] - Callback to clear filter
 */
export function renderList(container, state, renderItem, options = {}) {
    container.innerHTML = '';

    // Show filter indicator if active
    if (options.activeFilter) {
        const filterBar = document.createElement('div');
        filterBar.className = 'filter-bar';
        filterBar.innerHTML = `
            <span>Filtering: <strong>#${options.activeFilter}</strong></span>
            <button class="filter-clear-btn">✕ Clear</button>
        `;
        if (options.onClearFilter) {
            filterBar.querySelector('.filter-clear-btn').addEventListener('click', options.onClearFilter);
        }
        container.appendChild(filterBar);
    }

    // Render each section
    ['inbox', 'next', 'shipToday'].forEach(sectionKey => {
        let items = state[sectionKey] || [];

        // Apply filter if active
        if (options.activeFilter) {
            items = items.filter(item =>
                item.tags && item.tags.some(t =>
                    t.replace('#', '').toLowerCase() === options.activeFilter.toLowerCase()
                )
            );
        }

        const sectionEl = renderSection(sectionKey, items, renderItem);
        container.appendChild(sectionEl);
    });
}

/**
 * Get section configuration
 * @param {string} sectionKey
 * @returns {Object|null}
 */
export function getSectionConfig(sectionKey) {
    return SECTION_CONFIG[sectionKey] || null;
}

export default {
    renderSection,
    renderList,
    getSectionConfig,
    SECTION_CONFIG
};
