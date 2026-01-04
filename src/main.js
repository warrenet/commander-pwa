/**
 * Commander PWA - Main Entry Point
 * Initializes database, state, and UI
 * @module main
 */

import { initDB } from './db.js';
import { initState, setCurrentView } from './state.js';
import { initUI } from './ui.js';
import { getFilledTemplate } from './templates.js';
import { getLaunchParams, applyLaunchParams } from './integrations.js';

// App version (injected at build time)
const APP_VERSION = typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : 'dev';

// [Deleted] Legacy routing functions (replaced by integrations.js)

/**
 * Bootstrap the application
 */
async function bootstrap() {
    console.log(`[Commander] Starting v${APP_VERSION}...`);

    // Check for safe mode first
    const routing = getLaunchParams();
    if (routing?.safemode) {
        showSafeMode();
        return;
    }

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

        // Apply deep link routing
        applyLaunchParams(routing, setCurrentView);

        // Listen for template events from integrations
        window.addEventListener('commander-fill-template', (e) => {
            const textarea = document.getElementById('captureTextarea');
            if (textarea && e.detail.template) {
                textarea.value = getFilledTemplate(e.detail.template, {});
            }
        });

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
        showErrorRecovery(err);
    }
}

/**
 * Show safe mode UI for recovery
 */
function showSafeMode() {
    document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: #0a0a0f; color: #f0f0f5; min-height: 100vh;">
      <h1 style="color: #f59e0b;">🛡️ Commander Safe Mode</h1>
      <p style="color: #a0a0b0; margin: 16px 0;">Running in minimal mode for recovery and debugging.</p>
      
      <div style="margin: 24px 0; display: flex; flex-direction: column; gap: 12px;">
        <button onclick="exportEmergencyBackup()" style="padding: 16px; background: #00d4ff; color: #000; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          📦 Export Emergency Backup
        </button>
        <button onclick="location.href='./?'" style="padding: 16px; background: #1a1a24; color: #f0f0f5; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          🔄 Try Normal Mode
        </button>
        <button onclick="clearAndReload()" style="padding: 16px; background: #ef4444; color: #fff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          🗑️ Clear Cache & Reload
        </button>
      </div>
      
      <div style="background: #12121a; padding: 16px; border-radius: 8px; margin-top: 24px;">
        <h3 style="margin-bottom: 12px;">Diagnostics</h3>
        <p style="font-size: 14px; color: #606070;">Version: ${APP_VERSION}</p>
        <p style="font-size: 14px; color: #606070;" id="swStatus">Service Worker: Checking...</p>
        <p style="font-size: 14px; color: #606070;" id="dbStatus">Database: Checking...</p>
      </div>
    </div>
  `;

    // Check SW status
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            document.getElementById('swStatus').textContent =
                'Service Worker: ' + (reg.active ? '🟢 Active' : '🟡 Waiting');
        }).catch(() => {
            document.getElementById('swStatus').textContent = 'Service Worker: 🔴 Error';
        });
    }

    // Check DB status
    try {
        const req = indexedDB.open('commander-db');
        req.onsuccess = () => {
            document.getElementById('dbStatus').textContent = 'Database: 🟢 Accessible';
        };
        req.onerror = () => {
            document.getElementById('dbStatus').textContent = 'Database: 🔴 Error';
        };
    } catch (e) {
        document.getElementById('dbStatus').textContent = 'Database: 🔴 Failed';
    }

    // Global functions for buttons
    window.exportEmergencyBackup = async function () {
        try {
            const request = indexedDB.open('commander-db', 3);
            request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction('documents', 'readonly');
                const store = tx.objectStore('documents');
                const getReq = store.get('main');

                getReq.onsuccess = () => {
                    const data = getReq.result || {};
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `commander-emergency-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                };
            };
        } catch (err) {
            alert('Export failed: ' + err.message);
        }
    };

    window.clearAndReload = async function () {
        if (confirm('This will clear cached files (not your data). Continue?')) {
            if ('caches' in window) {
                const names = await caches.keys();
                await Promise.all(names.map(n => caches.delete(n)));
            }
            location.reload();
        }
    };
}

/**
 * Show error recovery UI
 */
function showErrorRecovery(err) {
    document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: #0a0a0f; color: #f0f0f5; min-height: 100vh;">
      <h1 style="color: #ef4444;">⚠️ Commander Failed to Start</h1>
      <p style="color: #a0a0b0; margin: 16px 0;">${err.message}</p>
      
      <div style="margin: 24px 0; display: flex; flex-direction: column; gap: 12px;">
        <button onclick="location.reload()" style="padding: 16px; background: #00d4ff; color: #000; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          🔄 Try Again
        </button>
        <button onclick="location.href='./?safemode=1'" style="padding: 16px; background: #f59e0b; color: #000; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
          🛡️ Enter Safe Mode
        </button>
      </div>
      
      <details style="margin-top: 24px; background: #12121a; padding: 16px; border-radius: 8px;">
        <summary style="cursor: pointer; color: #606070;">Technical Details</summary>
        <pre style="font-size: 12px; color: #ef4444; margin-top: 12px; overflow-x: auto;">${err.stack || err}</pre>
      </details>
    </div>
  `;
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
