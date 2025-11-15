// src/index.ts
// Top-level entry for 'star-rating-plus'.
// - injects `dist/tailwind.css` into DOM automatically (for bundlers that keep the file alongside the JS).
// - re-exports the React component(s) and also registers the web-component side-effect if desired.

export * from './components/StarRating';
export { StarRating } from './components/StarRating';

// Try to automatically inject CSS at runtime for browser consumers.
// This will create a <link rel="stylesheet" href=".../tailwind.css"> pointing to the package dist file.
// It runs only in browser environments (document exists) and when import.meta.url is supported (ESM).
const _import_meta_url = typeof import.meta !== 'undefined' ? import.meta.url : (typeof document !== 'undefined' ? (document.currentScript as HTMLScriptElement)?.src || '' : '');

if (typeof document !== 'undefined') {
  try {
    // Resolve the CSS file relative to this module
    const cssUrl = new URL('../dist/tailwind.css', _import_meta_url).toString();
    // Avoid injecting multiple times
    if (!document.querySelector(`link[href="${cssUrl}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      document.head.appendChild(link);
    }
  } catch {
    // Fallback: some bundlers might rewrite paths — do nothing and fallback to explicit import.
    // Consumers can still import 'star-rating-plus/dist/tailwind.css' when needed.
  }
}

// Auto-register web-component (optional). If you also export a separate web-component entry, keep the import here.
// This line should register the <star-rating> custom element (if your module does so).
try {
  // dynamic import (side-effect)
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  import('./web-component/registerStar');
} catch {
  // ignore in non-bundled or server environments
}
