// Hits key static/ISR pages once right after a deploy so the first real
// visitor never pays the cold-cache/cold-start cost (see /commercial, /services
// "slow on first visit" reports — Next.js regenerates ISR pages on the first
// hit after each deploy, then serves cached HTML to everyone after).
const BASE_URL = process.env.WARMUP_BASE_URL || "http://localhost:3000";

const PATHS = [
  "/",
  "/buy",
  "/rent",
  "/sell",
  "/lease",
  "/invest",
  "/commercial",
  "/farming",
  "/industrial",
  "/seized-property",
  "/properties",
  "/services",
  "/projects",
];

for (const path of PATHS) {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    console.log(`${res.status} ${path}`);
  } catch (err) {
    console.error(`FAILED ${path}: ${err.message}`);
  }
}
