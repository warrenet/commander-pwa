/**
 * IndexedDB wrapper for Commander PWA
 * Provides atomic writes and crash-safe persistence
 * @module db
 */

import { openDB } from 'idb';

const DB_NAME = 'commander-db';
const DB_VERSION = 3; // v3: schema versioning + shipped array
const STORE_NAME = 'documents';
const PENDING_STORE = 'pending';

// Current schema version for document structure
export const SCHEMA_VERSION = 3;

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
        },
    });

    // Run schema migrations after DB is open
    await runMigrations();

    return db;
}

/**
 * Run document-level schema migrations
 */
async function runMigrations() {
    const doc = await db.get(STORE_NAME, 'main');
    if (!doc) return; // No document yet, nothing to migrate

    let needsSave = false;
    const migrated = { ...doc };

    // Migration: Add schemaVersion if missing
    if (!migrated.schemaVersion) {
        console.log('[DB] Migrating: Adding schemaVersion');
        migrated.schemaVersion = 1;
        needsSave = true;
    }

    // Migration v1 → v2: Ensure logs array exists
    if (migrated.schemaVersion < 2) {
        console.log('[DB] Migrating v1 → v2: Ensuring logs array');
        if (!Array.isArray(migrated.logs)) {
            migrated.logs = [];
        }
        migrated.schemaVersion = 2;
        needsSave = true;
    }

    // Migration v2 → v3: Ensure shipped array exists
    if (migrated.schemaVersion < 3) {
        console.log('[DB] Migrating v2 → v3: Ensuring shipped array');
        if (!Array.isArray(migrated.shipped)) {
            migrated.shipped = [];
        }
        // Ensure all items have IDs (prevent duplicate ID crashes)
        ['inbox', 'next', 'shipToday'].forEach(section => {
            if (Array.isArray(migrated[section])) {
                migrated[section] = migrated[section].map((item, idx) => {
                    if (!item.id) {
                        return { ...item, id: `migrated_${section}_${idx}_${Date.now()}` };
                    }
                    return item;
                });
            }
        });
        migrated.schemaVersion = 3;
        needsSave = true;
    }

    if (needsSave) {
        console.log('[DB] Saving migrated document');
        await saveDocument(migrated);
    }
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
        schemaVersion: SCHEMA_VERSION,
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
        schemaVersion: SCHEMA_VERSION,
        inbox: Array.isArray(data.inbox) ? data.inbox : [],
        next: Array.isArray(data.next) ? data.next : [],
        shipToday: Array.isArray(data.shipToday) ? data.shipToday : [],
        logs: Array.isArray(data.logs) ? data.logs : [],
        shipped: Array.isArray(data.shipped) ? data.shipped : [],
    };

    await saveDocument(doc);
}

/**
 * Create a default empty document
 * @returns {Object}
 */
export function createDefaultDocument() {
    return {
        schemaVersion: SCHEMA_VERSION,
        inbox: [],
        next: [],
        shipToday: [],
        logs: [],
        shipped: [],
    };
}

/**
 * Get database diagnostics info
 * @returns {Promise<Object>}
 */
export async function getDiagnostics() {
    try {
        const doc = await loadDocument();
        return {
            dbName: DB_NAME,
            dbVersion: DB_VERSION,
            schemaVersion: doc?.schemaVersion || 'unknown',
            itemCounts: {
                inbox: doc?.inbox?.length || 0,
                next: doc?.next?.length || 0,
                shipToday: doc?.shipToday?.length || 0,
                logs: doc?.logs?.length || 0,
                shipped: doc?.shipped?.length || 0,
            },
            lastUpdated: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : 'never',
        };
    } catch (err) {
        return { error: err.message };
    }
}
