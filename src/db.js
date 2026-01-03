/**
 * IndexedDB wrapper for Commander PWA
 * Provides atomic writes and crash-safe persistence
 * @module db
 */

import { openDB } from 'idb';

const DB_NAME = 'commander-db';
const DB_VERSION = 2; // Upgraded for logs support
const STORE_NAME = 'documents';
const PENDING_STORE = 'pending';

/** @type {import('idb').IDBPDatabase | null} */
let db = null;

/**
 * Initialize the database connection
 * @returns {Promise<import('idb').IDBPDatabase>}
 */
export async function initDB() {
    if (db) return db;

    db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(database, oldVersion, newVersion) {
            console.log(`[DB] Upgrading from v${oldVersion} to v${newVersion}`);

            // Main document store (v1)
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
            // Pending writes store for crash recovery (v1)
            if (!database.objectStoreNames.contains(PENDING_STORE)) {
                database.createObjectStore(PENDING_STORE, { keyPath: 'id' });
            }

            // v2: logs field added to document - no schema change needed
            // logs are stored as an array field in the main document
        },
    });

    return db;
}

/**
 * Save document with atomic transaction
 * @param {Object} doc - Document to save
 * @returns {Promise<void>}
 */
export async function saveDocument(doc) {
    const database = await initDB();
    const tx = database.transaction(STORE_NAME, 'readwrite');

    await tx.store.put({
        id: 'main',
        ...doc,
        updatedAt: Date.now(),
    });

    await tx.done;

    // Clear any pending writes after successful save
    await clearPendingWrite();
}

/**
 * Load the main document
 * @returns {Promise<Object|null>}
 */
export async function loadDocument() {
    const database = await initDB();

    // First check for pending writes (crash recovery)
    const pending = await database.get(PENDING_STORE, 'main');
    if (pending) {
        console.log('[DB] Recovering from pending write');
        // Promote pending to main
        await saveDocument(pending);
        return pending;
    }

    return database.get(STORE_NAME, 'main');
}

/**
 * Save a pending write for crash recovery
 * This is called before the actual save completes
 * @param {Object} doc - Document to save as pending
 * @returns {Promise<void>}
 */
export async function savePendingWrite(doc) {
    const database = await initDB();
    const tx = database.transaction(PENDING_STORE, 'readwrite');

    await tx.store.put({
        id: 'main',
        ...doc,
        pendingAt: Date.now(),
    });

    await tx.done;
}

/**
 * Clear pending writes after successful save
 * @returns {Promise<void>}
 */
export async function clearPendingWrite() {
    const database = await initDB();
    const tx = database.transaction(PENDING_STORE, 'readwrite');

    await tx.store.delete('main');
    await tx.done;
}

/**
 * Export full database state as JSON
 * @returns {Promise<Object>}
 */
export async function exportState() {
    const doc = await loadDocument();
    return doc || createDefaultDocument();
}

/**
 * Import state and replace existing data
 * @param {Object} data - Data to import
 * @returns {Promise<void>}
 */
export async function importState(data) {
    // Validate structure
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid import data');
    }

    const doc = {
        inbox: Array.isArray(data.inbox) ? data.inbox : [],
        next: Array.isArray(data.next) ? data.next : [],
        shipToday: Array.isArray(data.shipToday) ? data.shipToday : [],
        logs: Array.isArray(data.logs) ? data.logs : [],
    };

    await saveDocument(doc);
}

/**
 * Create a default empty document
 * @returns {Object}
 */
export function createDefaultDocument() {
    return {
        inbox: [],
        next: [],
        shipToday: [],
        logs: [],
    };
}

