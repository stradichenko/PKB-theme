/**
 * Performance Utilities Library
 * Provides requestIdleCallback polyfill and performance optimization tools
 */

// ✅ RequestIdleCallback polyfill with fallback
const createIdleCallback = () => {
  if (typeof window.requestIdleCallback === 'function') {
    return {
      request: window.requestIdleCallback.bind(window),
      cancel: window.cancelIdleCallback.bind(window)
    };
  }
  
  // Polyfill implementation
  let id = 0;
  const callbacks = new Map();
  
  const request = (callback, options = {}) => {
    const timeout = options.timeout || 5000;
    const callbackId = ++id;
    
    const startTime = performance.now();
    
    const timeoutId = setTimeout(() => {
      const timeRemaining = () => Math.max(0, 16.67 - (performance.now() - startTime));
      const didTimeout = performance.now() - startTime >= timeout;
      
      if (callbacks.has(callbackId)) {
        callbacks.delete(callbackId);
        try {
          callback({ timeRemaining, didTimeout });
        } catch (error) {
          console.error('Idle callback error:', error);
        }
      }
    }, 0);
    
    callbacks.set(callbackId, timeoutId);
    return callbackId;
  };
  
  const cancel = (callbackId) => {
    if (callbacks.has(callbackId)) {
      clearTimeout(callbacks.get(callbackId));
      callbacks.delete(callbackId);
    }
  };
  
  return { request, cancel };
};

const { request: requestIdleCallback, cancel: cancelIdleCallback } = createIdleCallback();

// ✅ Task Queue Manager for batching operations
class IdleTaskQueue {
  constructor(options = {}) {
    this.queue = [];
    this.isProcessing = false;
    this.maxTasksPerFrame = options.maxTasksPerFrame || 5;
    this.timeSlice = options.timeSlice || 5; // ms
    this.onEmpty = options.onEmpty || null;
    this.onError = options.onError || console.error;
  }
  
  add(task, priority = 0) {
    if (typeof task !== 'function') {
      throw new Error('Task must be a function');
    }
    
    this.queue.push({ task, priority, id: Date.now() + Math.random() });
    this.queue.sort((a, b) => b.priority - a.priority);
    
    if (!this.isProcessing) {
      this.process();
    }
  }
  
  process() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      if (this.onEmpty) this.onEmpty();
      return;
    }
    
    this.isProcessing = true;
    
    requestIdleCallback((deadline) => {
      const startTime = performance.now();
      let tasksProcessed = 0;
      
      while (
        this.queue.length > 0 && 
        tasksProcessed < this.maxTasksPerFrame &&
        (deadline.timeRemaining() > this.timeSlice || deadline.didTimeout)
      ) {
        const { task } = this.queue.shift();
        
        try {
          task();
          tasksProcessed++;
        } catch (error) {
          this.onError('Task execution error:', error);
        }
        
        // Prevent blocking for too long
        if (performance.now() - startTime > this.timeSlice) {
          break;
        }
      }
      
      // Continue processing if there are more tasks
      if (this.queue.length > 0) {
        this.process();
      } else {
        this.isProcessing = false;
        if (this.onEmpty) this.onEmpty();
      }
    }, { timeout: 1000 });
  }
  
  clear() {
    this.queue = [];
    this.isProcessing = false;
  }
  
  size() {
    return this.queue.length;
  }
}

// ✅ Performance-optimized debounce
const debounce = (func, wait, options = {}) => {
  let timeout;
  let lastArgs;
  let lastThis;
  let result;
  let lastCallTime;
  let lastInvokeTime = 0;
  
  const { leading = false, trailing = true, maxWait } = options;
  
  const invokeFunc = (time) => {
    const args = lastArgs;
    const thisArg = lastThis;
    
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  };
  
  const leadingEdge = (time) => {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  };
  
  const remainingWait = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    
    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };
  
  const shouldInvoke = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (lastCallTime === undefined || 
            timeSinceLastCall >= wait ||
            timeSinceLastCall < 0 ||
            (maxWait !== undefined && timeSinceLastInvoke >= maxWait));
  };
  
  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  };
  
  const trailingEdge = (time) => {
    timeout = undefined;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  };
  
  const debounced = function(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timeout === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeout = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeout === undefined) {
      timeout = setTimeout(timerExpired, wait);
    }
    return result;
  };
  
  debounced.cancel = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeout = undefined;
  };
  
  debounced.flush = () => {
    return timeout === undefined ? result : trailingEdge(Date.now());
  };
  
  return debounced;
};

// ✅ Throttle with requestAnimationFrame option
const throttle = (func, wait, options = {}) => {
  const { leading = true, trailing = true, useRAF = false } = options;
  
  if (useRAF) {
    let rafId;
    let lastArgs;
    let lastThis;
    
    const throttled = function(...args) {
      lastArgs = args;
      lastThis = this;
      
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          func.apply(lastThis, lastArgs);
          rafId = null;
        });
      }
    };
    
    throttled.cancel = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
    
    return throttled;
  }
  
  return debounce(func, wait, { leading, trailing, maxWait: wait });
};

// ✅ DOM utilities with idle processing
const domUtils = {
  // Batch DOM reads and writes
  batchDOMOperations(reads = [], writes = []) {
    return new Promise(resolve => {
      // Fallback for browsers without requestIdleCallback
      const idleCallback = window.requestIdleCallback || 
                          ((cb) => setTimeout(cb, 16));
      
      idleCallback(() => {
        // Batch all reads first
        const readResults = reads.map(read => {
          try {
            return read();
          } catch (error) {
            console.warn('DOM read operation failed:', error);
            return null;
          }
        });
        
        // Then batch all writes
        requestAnimationFrame(() => {
          writes.forEach(write => {
            try {
              write();
            } catch (error) {
              console.warn('DOM write operation failed:', error);
            }
          });
          resolve(readResults);
        });
      });
    });
  },
  
  // Efficient element visibility check
  isElementVisible(element, threshold = 0) {
    if (!element || !element.getBoundingClientRect) return false;
    
    try {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      
      return (
        rect.bottom >= threshold &&
        rect.right >= threshold &&
        rect.top <= windowHeight - threshold &&
        rect.left <= windowWidth - threshold
      );
    } catch (error) {
      console.warn('Visibility check failed:', error);
      return false;
    }
  },
  
  // Intersection Observer with idle callback and fallback
  createIntersectionObserver(callback, options = {}) {
    if (!window.IntersectionObserver) {
      // Fallback for older browsers
      console.warn('IntersectionObserver not supported, using fallback');
      return {
        observe: () => {},
        unobserve: () => {},
        disconnect: () => {}
      };
    }
    
    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });
  }
};

// ✅ Performance monitoring
const performanceMonitor = {
  marks: new Map(),
  measures: new Map(),
  
  mark(name) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
    this.marks.set(name, Date.now());
  },
  
  measure(name, startMark, endMark) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (e) {
        // Fallback for unsupported marks
      }
    }
    
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : Date.now();
    
    if (start && end) {
      const duration = end - start;
      this.measures.set(name, duration);
      return duration;
    }
    
    return null;
  },
  
  getMetrics() {
    const metrics = {};
    
    // Get performance entries if available
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const measures = performance.getEntriesByType('measure');
      measures.forEach(measure => {
        metrics[measure.name] = measure.duration;
      });
    }
    
    // Add fallback measures
    this.measures.forEach((duration, name) => {
      if (!metrics[name]) {
        metrics[name] = duration;
      }
    });
    
    return metrics;
  },
  
  clear() {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
    this.marks.clear();
    this.measures.clear();
  }
};

// ✅ Event utilities
const eventUtils = {
  // Passive event listener helper
  addPassiveListener(element, event, handler, options = {}) {
    const opts = { passive: true, ...options };
    element.addEventListener(event, handler, opts);
    
    return () => element.removeEventListener(event, handler, opts);
  },
  
  // Event delegation with performance optimization
  delegate(container, selector, event, handler) {
    const delegatedHandler = (e) => {
      const target = e.target.closest(selector);
      if (target && container.contains(target)) {
        handler.call(target, e);
      }
    };
    
    container.addEventListener(event, delegatedHandler);
    return () => container.removeEventListener(event, delegatedHandler);
  },
  
  // Once event listener
  once(element, event, handler) {
    const onceHandler = (e) => {
      handler(e);
      element.removeEventListener(event, onceHandler);
    };
    
    element.addEventListener(event, onceHandler);
    return () => element.removeEventListener(event, onceHandler);
  }
};

// ✅ Global task queue instance
const globalTaskQueue = new IdleTaskQueue({
  maxTasksPerFrame: 5,
  timeSlice: 5,
  onEmpty: () => {
    console.debug('Task queue emptied');
  }
});

// ✅ Export utilities
window.PKBUtils = {
  requestIdleCallback,
  cancelIdleCallback,
  IdleTaskQueue,
  globalTaskQueue,
  debounce,
  throttle,
  domUtils,
  performanceMonitor,
  eventUtils
};

// ✅ Auto-initialize performance monitoring
if (typeof performance !== 'undefined') {
  performanceMonitor.mark('utils-loaded');
}

// ✅ Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.PKBUtils;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.PKBUtils;
}
