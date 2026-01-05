/**
 * Validation & Safety Utilities (Future-Proofing)
 * Defensive coding helpers to prevent bugs
 * @module utils/validate
 */

/**
 * Safely get a value from localStorage
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function safeGetStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        if (value === null) return defaultValue;
        return JSON.parse(value);
    } catch (error) {
        console.warn(`[Validate] Error reading ${key} from localStorage:`, error);
        return defaultValue;
    }
}

/**
 * Safely set a value in localStorage
 * @param {string} key
 * @param {*} value
 * @returns {boolean} Success
 */
export function safeSetStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`[Validate] Error writing ${key} to localStorage:`, error);
        return false;
    }
}

/**
 * Check if a DOM element exists
 * @param {string} selector
 * @returns {HTMLElement|null}
 */
export function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.warn(`[Validate] Invalid selector: ${selector}`);
        return null;
    }
}

/**
 * Safely call a function with error handling
 * @param {Function} fn
 * @param {*} fallback - Value to return on error
 * @returns {*}
 */
export function safeTry(fn, fallback = null) {
    try {
        return fn();
    } catch (error) {
        console.warn('[Validate] safeTry caught error:', error);
        return fallback;
    }
}

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle a function
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
export function throttle(fn, limit = 100) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Check browser feature support
 * @returns {Object}
 */
export function checkFeatureSupport() {
    return {
        vibration: 'vibrate' in navigator,
        speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
        serviceWorker: 'serviceWorker' in navigator,
        indexedDB: 'indexedDB' in window,
        clipboard: 'clipboard' in navigator,
        notifications: 'Notification' in window,
        share: 'share' in navigator,
        storage: 'localStorage' in window
    };
}

/**
 * Assert a condition (throws if false in dev)
 * @param {boolean} condition
 * @param {string} message
 */
export function assert(condition, message) {
    if (!condition) {
        if (typeof __BUILD_VERSION__ === 'undefined' || __BUILD_VERSION__ === 'dev') {
            throw new Error(`[Assert] ${message}`);
        } else {
            console.error(`[Assert] ${message}`);
        }
    }
}

/**
 * Deep clone an object (safe alternative to structuredClone)
 * @param {*} obj
 * @returns {*}
 */
export function safeClone(obj) {
    try {
        return typeof structuredClone === 'function'
            ? structuredClone(obj)
            : JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.warn('[Validate] Clone failed:', error);
        return obj;
    }
}

/**
 * Validate required fields on an object
 * @param {Object} obj
 * @param {string[]} requiredFields
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateRequired(obj, requiredFields) {
    const missing = requiredFields.filter(field =>
        obj[field] === undefined || obj[field] === null
    );
    return {
        valid: missing.length === 0,
        missing
    };
}

export default {
    safeGetStorage,
    safeSetStorage,
    safeQuerySelector,
    safeTry,
    debounce,
    throttle,
    checkFeatureSupport,
    assert,
    safeClone,
    validateRequired
};
