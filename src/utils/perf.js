/**
 * Performance & Reliability Utilities
 * Error boundaries, logging, and optimization helpers
 * @module utils/perf
 */

/**
 * Performance monitoring state
 */
let perfMetrics = {
    appStartTime: Date.now(),
    renderCount: 0,
    lastRenderTime: 0,
    errors: []
};

/**
 * Initialize global error handler
 */
export function initErrorBoundary() {
    // Catch unhandled errors
    window.onerror = (message, source, lineno, colno, error) => {
        logError('window.onerror', { message, source, lineno, colno, error });
        return false; // Let default handler run too
    };

    // Catch unhandled promise rejections
    window.onunhandledrejection = (event) => {
        logError('unhandledrejection', { reason: event.reason });
    };

    console.log('[Perf] Error boundary initialized');
}

/**
 * Log an error for debugging
 * @param {string} context
 * @param {Object} details
 */
export function logError(context, details) {
    const entry = {
        timestamp: Date.now(),
        context,
        details: typeof details === 'object' ? JSON.stringify(details) : details
    };

    perfMetrics.errors.push(entry);

    // Keep only last 50 errors
    if (perfMetrics.errors.length > 50) {
        perfMetrics.errors.shift();
    }

    console.error(`[Error:${context}]`, details);
}

/**
 * Track render performance
 * @param {string} component
 * @param {Function} renderFn
 * @returns {*} Result of renderFn
 */
export function trackRender(component, renderFn) {
    const start = performance.now();
    let result;

    try {
        result = renderFn();
    } catch (error) {
        logError(`render:${component}`, error);
        throw error;
    }

    const duration = performance.now() - start;
    perfMetrics.lastRenderTime = duration;
    perfMetrics.renderCount++;

    // Warn if render takes too long (>16ms = missed frame)
    if (duration > 16) {
        console.warn(`[Perf] Slow render: ${component} took ${duration.toFixed(2)}ms`);
    }

    return result;
}

/**
 * Memoize a function (cache results)
 * @param {Function} fn
 * @returns {Function}
 */
export function memoize(fn) {
    const cache = new Map();
    return function (...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);

        // Limit cache size
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        return result;
    };
}

/**
 * Lazy load a module
 * @param {Function} importFn - Dynamic import function
 * @returns {Promise}
 */
export async function lazyLoad(importFn) {
    try {
        return await importFn();
    } catch (error) {
        logError('lazyLoad', error);
        throw error;
    }
}

/**
 * Request idle callback wrapper (with fallback)
 * @param {Function} callback
 * @param {Object} [options]
 */
export function onIdle(callback, options = {}) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, options);
    } else {
        setTimeout(callback, options.timeout || 50);
    }
}

/**
 * Get current performance metrics
 * @returns {Object}
 */
export function getMetrics() {
    return {
        ...perfMetrics,
        uptime: Date.now() - perfMetrics.appStartTime,
        errorCount: perfMetrics.errors.length
    };
}

/**
 * Clear error log
 */
export function clearErrors() {
    perfMetrics.errors = [];
}

/**
 * Register Service Worker with error handling
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerSW() {
    if (!('serviceWorker' in navigator)) {
        console.warn('[Perf] Service Worker not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[Perf] Service Worker registered:', registration.scope);
        return registration;
    } catch (error) {
        logError('registerSW', error);
        return null;
    }
}

/**
 * Check if app is running efficiently
 * @returns {{ status: 'good' | 'warning' | 'critical', issues: string[] }}
 */
export function healthCheck() {
    const issues = [];
    const metrics = getMetrics();

    // Check error count
    if (metrics.errorCount > 10) {
        issues.push(`High error count: ${metrics.errorCount}`);
    }

    // Check render time
    if (metrics.lastRenderTime > 50) {
        issues.push(`Slow renders: ${metrics.lastRenderTime.toFixed(2)}ms`);
    }

    // Check memory (if available)
    if (performance.memory) {
        const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
        if (usedMB > 100) {
            issues.push(`High memory: ${usedMB.toFixed(1)}MB`);
        }
    }

    return {
        status: issues.length === 0 ? 'good' : issues.length < 3 ? 'warning' : 'critical',
        issues
    };
}

export default {
    initErrorBoundary,
    logError,
    trackRender,
    memoize,
    lazyLoad,
    onIdle,
    getMetrics,
    clearErrors,
    registerSW,
    healthCheck
};
