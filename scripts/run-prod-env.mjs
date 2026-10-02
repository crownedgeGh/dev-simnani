// `next dev` always loads `.env.local` with higher priority than whatever
// `dotenv -e prod.env` injects into process.env, so prod.env values (like
// ADMIN_PASSWORD_HASH) silently got overridden by .env.local's dev values.
// Move .env.local out of the way for the duration of the dev server, and
// restore it on exit (including Ctrl+C / kill) so local dev is never left
// broken.
import { existsSync, renameSync } from "node:fs";
import { spawn } from "node:child_process";

const ENV_LOCAL = ".env.local";
const ENV_LOCAL_BAK = ".env.local.bak";

const hadEnvLocal = existsSync(ENV_LOCAL);
if (hadEnvLocal) renameSync(ENV_LOCAL, ENV_LOCAL_BAK);

function restore() {
  if (hadEnvLocal && existsSync(ENV_LOCAL_BAK)) {
    renameSync(ENV_LOCAL_BAK, ENV_LOCAL);
  }
}

const child = spawn("npx", ["dotenv", "-e", "prod.env", "--", "next", "dev"], {
  stdio: "inherit",
  shell: true,
});

for (const sig of ["SIGINT", "SIGTERM", "exit"]) {
  process.on(sig, () => {
    restore();
    if (sig !== "exit") process.exit();
  });
}

child.on("exit", (code) => {
  restore();
  process.exit(code ?? 0);
});
