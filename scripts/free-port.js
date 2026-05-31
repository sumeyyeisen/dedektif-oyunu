#!/usr/bin/env node
const { execSync } = require("node:child_process");

const port = process.argv[2];
if (!port) {
  console.error("Usage: node scripts/free-port.js <port>");
  process.exit(1);
}

function tryExec(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
  } catch {
    return "";
  }
}

// macOS / Linux: lsof is the most reliable here.
const pids = tryExec(`lsof -nP -t -iTCP:${port} -sTCP:LISTEN`)
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

if (pids.length === 0) {
  process.exit(0);
}

for (const pid of pids) {
  // Try graceful first.
  tryExec(`kill ${pid}`);
}

// Give processes a moment to exit, then hard kill if needed.
tryExec("sleep 0.5");

const stillThere = tryExec(`lsof -nP -t -iTCP:${port} -sTCP:LISTEN`)
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

for (const pid of stillThere) {
  tryExec(`kill -9 ${pid}`);
}

