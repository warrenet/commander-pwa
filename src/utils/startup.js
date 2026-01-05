/**
 * Startup Optimizer
 * Handles app initialization sequence for reliability
 * @module utils/startup
 */

import { initErrorBoundary, logError, onIdle } from './perf.js';
import { checkFeatureSupport } from './validate.js';

/**
 * Startup sequence with error recovery
 * @param {Object} options
 * @param {Function} options.initState - State initialization function
 * @param {Function} options.initUI - UI initialization function
 * @param {Function} [options.onReady] - Callback when ready
 * @param {Function} [options.onError] - Error callback
 */
export async function startApp(options) {
    const { initState, initUI, onReady, onError } = options;

    console.log('[Startup] Beginning initialization...');

    // 1. Initialize error boundary first
    initErrorBoundary();

    // 2. Check feature support
    const features = checkFeatureSupport();
    console.log('[Startup] Feature support:', features);

    // 3. Initialize state (critical)
    try {
        await initState();
        console.log('[Startup] State initialized');
    } catch (error) {
        logError('startup:initState', error);
        if (onError) onError('state', error);
        // Continue anyway - UI might work with default state
    }

    // 4. Initialize UI (critical)
    try {
        initUI();
        console.log('[Startup] UI initialized');
    } catch (error) {
        logError('startup:initUI', error);
        if (onError) onError('ui', error);
        showStartupError('UI initialization failed. Try refreshing.');
        return;
    }

    // 5. Non-critical initializations (defer to idle)
    onIdle(() => {
        initNonCritical();
    });

    // 6. Signal ready
    if (onReady) onReady();
    console.log('[Startup] App ready');
}

/**
 * Initialize non-critical features
 */
function initNonCritical() {
    // Prefetch templates
    try {
        // Templates are already imported, just ensure cached
        console.log('[Startup] Non-critical init complete');
    } catch (error) {
        logError('startup:nonCritical', error);
    }
}

/**
 * Show startup error to user
 * @param {string} message
 */
function showStartupError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0a0f;
        color: #ef4444;
        font-family: system-ui;
        padding: 20px;
        text-align: center;
        z-index: 9999;
    `;
    errorDiv.innerHTML = `
        <div>
            <h2>⚠️ Startup Error</h2>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                margin-top: 16px;
                padding: 12px 24px;
                background: #00d4ff;
                border: none;
                border-radius: 8px;
                color: #0a0a0f;
                font-weight: 600;
                cursor: pointer;
            ">Reload App</button>
            <button onclick="location.href='/?safemode=1'" style="
                margin-top: 16px;
                margin-left: 8px;
                padding: 12px 24px;
                background: #333;
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
            ">Safe Mode</button>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

/**
 * Check if app should start in safe mode
 * @returns {boolean}
 */
export function isSafeMode() {
    const params = new URLSearchParams(window.location.search);
    return params.has('safemode') || localStorage.getItem('commander-safemode') === '1';
}

/**
 * Enable safe mode for next startup
 */
export function enableSafeMode() {
    localStorage.setItem('commander-safemode', '1');
}

/**
 * Disable safe mode
 */
export function disableSafeMode() {
    localStorage.removeItem('commander-safemode');
}

export default {
    startApp,
    isSafeMode,
    enableSafeMode,
    disableSafeMode
};
