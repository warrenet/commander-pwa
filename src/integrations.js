/**
 * Integrations Module
 * Handles external intents, deep links, and third-party workflow integrations (MacroDroid, Shortcuts)
 * @module integrations
 */

/**
 * Parse URL parameters for deep linking
 * @returns {Object|null}
 */
export function getLaunchParams() {
    const params = new URLSearchParams(window.location.search);

    // safe mode check
    if (params.get('safemode') === '1') {
        return { safemode: true };
    }

    const screen = params.get('screen');
    const view = params.get('view'); // Direct view support
    const text = params.get('text');
    const template = params.get('template');
    const command = params.get('command');
    const tags = params.get('tags');
    const priority = params.get('priority');
    const silent = params.get('silent') === '1' || params.get('silent') === 'true';
    const autofocus = params.get('autofocus') === '1';

    // If practically empty, return null
    if (!screen && !view && !text && !template && !command) return null;

    return {
        view: view || mapScreenToView(screen) || (text ? 'capture' : null),
        template: mapScreenToTemplate(screen) || template,
        text,
        command,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        priority,
        silent,
        autofocus,
        originalParams: params
    };
}

/**
 * Map legacy screen names to views
 * @param {string} screen 
 */
function mapScreenToView(screen) {
    if (!screen) return null;
    const map = {
        'mission-control': 'capture',
        'micro-research': 'capture',
        'build-block': 'capture',
        'nightly-delta': 'capture',
        'capture': 'capture',
        'tasks': 'tasks',
        'inbox': 'tasks',
    };
    return map[screen];
}

/**
 * Map legacy screen names to templates
 * @param {string} screen 
 */
function mapScreenToTemplate(screen) {
    if (!screen) return null;
    const map = {
        'mission-control': 'MissionControl',
        'micro-research': 'MicroResearch',
        'build-block': 'BuildBlock',
        'nightly-delta': 'NightlyDelta',
    };
    return map[screen];
}

/**
 * Apply launch parameters to the UI
 * @param {Object} params 
 * @param {Function} setViewCallback 
 */
export function applyLaunchParams(params, setViewCallback) {
    if (!params) return;

    console.log('[Integrations] Applying launch params:', params);

    // 1. Dispatch Command Event (Core of v2.1 Automation)
    if (params.command || params.tags.length > 0 || params.priority || params.silent || params.text) {
        // Dispatch event for UI/Main to handle
        const event = new CustomEvent('commander-command', {
            detail: params
        });
        window.dispatchEvent(event);
    }

    // 2. Switch View (Ui Navigation)
    if (params.view) {
        setViewCallback(params.view);
    }

    // 3. Handle Capture View specifics (Legacy/Direct text handling)
    if (params.view === 'capture') {
        setTimeout(() => {
            const textarea = document.getElementById('captureTextarea');
            if (!textarea) return;

            // Pre-fill text if not handled by command
            // (If 'command' is 'add-task', it might be handled automatically without UI,
            // but if we are in capture view, we show it)
            if (params.text && !params.command) {
                textarea.value = params.text;
            }
            // Or Template
            else if (params.template) {
                const event = new CustomEvent('commander-fill-template', {
                    detail: { template: params.template }
                });
                window.dispatchEvent(event);
            }

            // Autofocus
            if ((params.autofocus || params.text) && !params.silent) {
                textarea.focus();
                if (textarea.value) {
                    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
                }
            }
        }, 100);
    }

    // Clean URL
    if (window.history.replaceState) {
        const cleanedUrl = window.location.pathname + (params.safemode ? '?safemode=1' : '');
        window.history.replaceState({}, document.title, cleanedUrl);
    }
}
