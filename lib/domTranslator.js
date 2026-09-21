/**
 * domTranslator.js — Real-time DOM-level Hindi translation engine
 *
 * Works WITHOUT touching any page components. Uses a MutationObserver to
 * intercept all text nodes (including dynamically rendered React content)
 * and replaces English text with Hindi using our pre-built translation map.
 *
 * Strategy:
 *  1. Build a lookup map: English value → Hindi value  (from en.json / hi.json)
 *  2. Walk every text node in document.body (TreeWalker)
 *  3. Replace exact + partial matches (longest-first to avoid double-replacement)
 *  4. Store original text in a WeakMap keyed to the text node (safe reference)
 *  5. MutationObserver catches new nodes added by React re-renders
 *  6. On revert: restore from WeakMap, disconnect observer
 */

const originalTexts = new Map(); // textNode → original string
let observer = null;
let lookupMap = {}; // English string → Hindi string
let sortedKeys = []; // sorted by length desc (longest-match-first)

// Tags whose text must never be translated
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE",
  "INPUT", "TEXTAREA", "SELECT", "OPTION",
  "SVG", "PATH", "G", "CIRCLE", "RECT",
  "META", "LINK", "TITLE",
]);

// ── Build translation map from en.json + hi.json ─────────────────────────────
export function initTranslator(enJson, hiJson) {
  lookupMap = {};

  for (const key of Object.keys(enJson)) {
    const src = enJson[key];
    const dst = hiJson[key];
    if (src && dst && src !== dst) {
      lookupMap[src.trim()] = dst;
    }
  }

  // Sort keys longest-first so "Carpet Area" is replaced before "Area"
  sortedKeys = Object.keys(lookupMap).sort((a, b) => b.length - a.length);
}

// ── Translate a single string ─────────────────────────────────────────────────
function translateString(text) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return text;

  // 1. Exact match (fastest path)
  if (lookupMap[trimmed] !== undefined) {
    // Preserve leading/trailing whitespace
    return text.replace(trimmed, lookupMap[trimmed]);
  }

  // 2. Partial / phrase replacement (longest-first)
  let result = text;
  for (const key of sortedKeys) {
    if (key.length > 2 && result.includes(key)) {
      result = result.split(key).join(lookupMap[key]);
    }
  }
  return result;
}

// ── Translate a single text node ─────────────────────────────────────────────
function translateNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return;

  // Skip nodes inside disallowed tags
  const parent = node.parentElement;
  if (!parent) return;
  if (SKIP_TAGS.has(parent.tagName)) return;
  // Skip if parent has data-no-translate
  if (parent.closest("[data-no-translate]")) return;

  const original = node.nodeValue;
  if (!original?.trim() || original.trim().length < 2) return;

  const translated = translateString(original);
  if (translated !== original) {
    // Store original only once (so re-renders don't overwrite the saved value)
    if (!originalTexts.has(node)) {
      originalTexts.set(node, original);
    }
    node.nodeValue = translated;
  }
}

// ── Walk a subtree and translate all text nodes ───────────────────────────────
function walkAndTranslate(root) {
  if (!root || typeof root.nodeType === "undefined") return;

  // Text node directly
  if (root.nodeType === Node.TEXT_NODE) {
    translateNode(root);
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(translateNode);
}

// ── Revert all translated nodes to English ────────────────────────────────────
function revertAll() {
  for (const [node, original] of originalTexts) {
    if (node.isConnected) {
      node.nodeValue = original;
    }
  }
  originalTexts.clear();
}

// ── Activate: translate + watch for React re-renders ─────────────────────────
export function activateHindi() {
  if (!document?.body) return;

  // Initial pass — translate everything currently in the DOM
  walkAndTranslate(document.body);

  // Batch pending nodes to avoid excessive work per frame
  let rafPending = false;
  const pendingNodes = [];

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const added of mutation.addedNodes) {
        pendingNodes.push(added);
      }
    }

    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        const toProcess = pendingNodes.splice(0);
        for (const node of toProcess) {
          walkAndTranslate(node);
        }
        rafPending = false;
      });
    }
  });

  // Only watch childList (new nodes React mounts)
  // Do NOT watch characterData — that would conflict with React's own updates
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// ── Deactivate: restore English + stop watching ───────────────────────────────
export function deactivateHindi() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  revertAll();
}
