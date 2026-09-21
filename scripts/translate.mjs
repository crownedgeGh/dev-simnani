#!/usr/bin/env node
/**
 * translate.mjs — Build-time Hindi translation script
 *
 * Uses MyMemory API (free, no account needed) to translate all keys in
 * lib/i18n/en.json into Hindi, then applies our custom real-estate glossary
 * on top to correct domain-specific terminology.
 *
 * Usage: npm run translate
 * Output: lib/i18n/hi.json
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);
const ROOT = join(__dir, "..");

// ── Load source files ──────────────────────────────────────────────────────
const enPath = join(ROOT, "lib", "i18n", "en.json");
const hiPath = join(ROOT, "lib", "i18n", "hi.json");
const glossaryPath = join(__dir, "real-estate-glossary.json");

const en = JSON.parse(readFileSync(enPath, "utf-8"));
const glossaryRaw = JSON.parse(readFileSync(glossaryPath, "utf-8")).glossary;

// Existing hi.json (so we don't re-translate unchanged keys)
let existingHi = {};
if (existsSync(hiPath)) {
  existingHi = JSON.parse(readFileSync(hiPath, "utf-8"));
}

// ── Build glossary lookup (case-sensitive word replacer) ───────────────────
// Sorted longest-first so "Carpet Area" is replaced before "Area"
const glossaryEntries = [...glossaryRaw].sort(
  (a, b) => b.en.length - a.en.length
);

function applyGlossary(text) {
  let result = text;
  for (const { en: src, hi: dst } of glossaryEntries) {
    // Escape special regex chars in source
    const escaped = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?<![\\u0900-\\u097F])${escaped}(?![\\u0900-\\u097F])`, "g");
    result = result.replace(re, dst);
  }
  return result;
}

// ── MyMemory API helper ────────────────────────────────────────────────────
const DELAY_MS = 350; // Stay within free tier rate limit (~3 req/s)

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function translateOne(text) {
  // First apply glossary to the English source — if the whole string is
  // already covered, skip the API call entirely.
  const glossaryVersion = applyGlossary(text);
  if (glossaryVersion !== text) {
    // Check if the replacement covers the whole string (no residual English)
    const hasResidualEnglish = /[A-Za-z]{3,}/.test(glossaryVersion);
    if (!hasResidualEnglish) return glossaryVersion;
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi&de=translate@simnani.com`;

  let attempts = 0;
  while (attempts < 3) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let translated = data?.responseData?.translatedText ?? text;

      // MyMemory sometimes returns HTML entities — decode them
      translated = translated
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");

      // Apply glossary corrections on top of API output
      translated = applyGlossary(translated);

      return translated;
    } catch (err) {
      attempts++;
      if (attempts < 3) {
        console.warn(`  ⚠  Retry ${attempts} for: "${text.slice(0, 40)}…"`);
        await sleep(1000 * attempts);
      } else {
        console.error(`  ✗  Failed after 3 attempts: "${text.slice(0, 40)}…"`);
        return applyGlossary(text); // Fall back to glossary-only
      }
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const keys = Object.keys(en);
  const toTranslate = keys.filter((k) => !existingHi[k]);

  console.log(`\n🌐  Simnani Estate — Hindi Translation Script`);
  console.log(`   Total keys : ${keys.length}`);
  console.log(`   Cached     : ${keys.length - toTranslate.length}`);
  console.log(`   To fetch   : ${toTranslate.length}\n`);

  if (toTranslate.length === 0) {
    console.log("✅  All keys already translated. hi.json is up to date.");
    process.exit(0);
  }

  const hi = { ...existingHi };
  let done = 0;

  for (const key of toTranslate) {
    const source = en[key];
    process.stdout.write(`  [${String(done + 1).padStart(3, " ")}/${toTranslate.length}] ${key} … `);
    const translated = await translateOne(source);
    hi[key] = translated;
    process.stdout.write(`${translated}\n`);
    done++;
    await sleep(DELAY_MS);
  }

  // Write output — preserve key order from en.json
  const ordered = {};
  for (const key of keys) {
    ordered[key] = hi[key] ?? en[key];
  }

  writeFileSync(hiPath, JSON.stringify(ordered, null, 2), "utf-8");
  console.log(`\n✅  Done! Wrote ${keys.length} keys to lib/i18n/hi.json\n`);
}

main().catch((err) => {
  console.error("Translation script failed:", err);
  process.exit(1);
});
