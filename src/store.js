/**
 * COMMANDER CORE - STATE STORE
 * Lightweight Pub/Sub state manager with undo history.
 * @module store
 */

export class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = new Set();
        this.history = [];
        this.maxHistory = 50;
    }

    /**
     * Get current state snapshot (deep copy to prevent mutation).
     * @returns {Object}
     */
    get() {
        return structuredClone(this.state);
    }

    /**
     * Update state and notify subscribers.
     * @param {Object|Function} updates - Partial state or updater function.
     * @param {boolean} [recordHistory=false] - Save to undo stack.
     */
    set(updates, recordHistory = false) {
        if (recordHistory) {
            this.history.push(structuredClone(this.state));
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }
        }

        const newValues = typeof updates === 'function'
            ? updates(this.state)
            : updates;

        this.state = { ...this.state, ...newValues };
        this.notify();
    }

    /**
     * Undo last recorded change.
     * @returns {boolean} True if undo was successful.
     */
    undo() {
        if (this.history.length === 0) return false;
        this.state = this.history.pop();
        this.notify();
        return true;
    }

    /**
     * Subscribe to state changes.
     * @param {Function} listener - Callback(state).
     * @returns {Function} Unsubscribe function.
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify all subscribers of state change.
     */
    notify() {
        const snapshot = this.get();
        this.listeners.forEach(fn => fn(snapshot));
    }
}

// Singleton app store
export const appStore = new Store({
    view: 'tasks',
    loading: false,
    selection: [],
    lastAction: null
});
