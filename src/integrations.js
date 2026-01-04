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
    const text = params.get('text');
    const template = params.get('template');
    const autofocus = params.get('autofocus') === '1';

    if (!screen && !text && !template) return null;

    return {
        view: mapScreenToView(screen) || 'capture',
        template: mapScreenToTemplate(screen) || template,
        text,
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

    // 1. Switch View
    if (params.view) {
        setViewCallback(params.view);
    }

    // 2. Handle Capture View specifics
    if (params.view === 'capture') {
        setTimeout(() => {
            const textarea = document.getElementById('captureTextarea');
            if (!textarea) return;

            // Pre-fill text
            if (params.text) {
                textarea.value = params.text;
            }
            // Or Template
            else if (params.template) {
                // Dynamically import templates if needed, or assume global/passed helper
                // For now, we rely on the main.js logic or we emit an event
                // But better to just handle it here if we have access to getFilledTemplate
                // We will dispatch a custom event for the UI to handle, to decouple
                const event = new CustomEvent('commander-fill-template', {
                    detail: { template: params.template }
                });
                window.dispatchEvent(event);
            }

            // Autofocus
            if (params.autofocus || params.text) {
                textarea.focus();
                // Move cursor to end if text exists
                if (textarea.value) {
                    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
                }
            }
        }, 100);
    }

    // Clean URL
    if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}
