// Utility to suppress development warnings
export const suppressHydrationWarning = () => {
  if (typeof window !== 'undefined') {
    // Suppress hydration warnings in development
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Hydration failed') ||
        args[0].includes('hydration mismatch') ||
        args[0].includes('Received NaN for the `children` attribute'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };
  }
};

// Suppress React DevTools warning
export const suppressDevToolsWarning = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Download the React DevTools') ||
        args[0].includes('Unchecked runtime.lastError'))
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }
};

// Suppress runtime.lastError messages
export const suppressRuntimeErrors = () => {
  if (typeof window !== 'undefined') {
    // Override chrome.runtime.lastError to prevent console errors
    if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.runtime) {
      const originalLastError = (window as any).chrome.runtime.lastError;
      Object.defineProperty((window as any).chrome.runtime, 'lastError', {
        get: () => null,
        configurable: true
      });
    }
  }
};
