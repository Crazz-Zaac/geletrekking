// Clean Project Tree Generator
// Usage: node tree.js

import fs from "fs";
import path from "path";

const IGNORE = ["node_modules", ".git", "dist", "build", ".vscode", "uploads", "coverage"];
const MAX_DEPTH = 3; // Adjust depth (2-4 is good for most projects)

function printTree(dir, prefix = "", depth = 0) {
  if (depth > MAX_DEPTH) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !IGNORE.includes(e.name));

  entries.forEach((entry, i) => {
    const isLast = i === entries.length - 1;
    console.log(`${prefix}${isLast ? "└── " : "├── "}${entry.name}`);
    printTree(
      path.join(dir, entry.name),
      prefix + (isLast ? "    " : "│   "),
      depth + 1
    );
  });
}

console.log("📁 Project Structure\n");
printTree(".");
