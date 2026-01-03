/**
 * Commander PWA - Main Entry Point
 * Initializes database, state, and UI
 * @module main
 */

import { initDB } from './db.js';
import { initState } from './state.js';
import { initUI } from './ui.js';

/**
 * Bootstrap the application
 */
async function bootstrap() {
    console.log('[Commander] Starting...');

    try {
        // Initialize database first
        await initDB();
        console.log('[Commander] Database initialized');

        // Load state from database
        await initState();
        console.log('[Commander] State loaded');

        // Initialize UI
        initUI();
        console.log('[Commander] UI initialized');

        // Register for visibility change to handle tab switching
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[Commander] App visible, refreshing state');
                initState();
            }
        });

        console.log('[Commander] Ready!');
    } catch (err) {
        console.error('[Commander] Bootstrap failed:', err);

        // Show error to user
        document.body.innerHTML = `
      <div style="padding: 20px; color: #ef4444; font-family: sans-serif;">
        <h1>⚠️ Commander Failed to Start</h1>
        <p>${err.message}</p>
        <p>Try refreshing the page. If the problem persists, clear your browser data.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">
          Reload
        </button>
      </div>
    `;
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
