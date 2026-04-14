"use strict";

const fs = require("fs");
const path = require("path");

const root = process.cwd();
for (const name of ["package-lock.json", "yarn.lock"]) {
  try {
    fs.unlinkSync(path.join(root, name));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}

const ua = process.env.npm_config_user_agent || "";
if (!ua.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}
