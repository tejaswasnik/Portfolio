/**
 * Regenerates `src/lib/icons/remixicon-index.json` from the installed
 * `remixicon` package's raw SVG files (fixes round 2, Fix 2). remixicon
 * ships no JSON data file of its own (unlike simple-icons/lucide-static),
 * so this reads every `icons/<category>/<slug>.svg`, pulls out its
 * `<path d="...">`, and writes a flat `{ slug: { category, path } }`
 * index — committed so `src/lib/icons/remixIcons.js` can import it
 * statically (see that file's header for why static import matters for
 * deployment).
 *
 * Run with: npm run generate:remixicon-index
 * Re-run only after bumping the `remixicon` dependency.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(dirname, "..", "node_modules", "remixicon", "icons");
const outPath = path.join(dirname, "..", "src", "lib", "icons", "remixicon-index.json");

const index = {};
const categories = fs.readdirSync(iconsDir, { withFileTypes: true }).filter((e) => e.isDirectory());

for (const category of categories) {
  const dir = path.join(iconsDir, category.name);
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".svg")) continue;
    const slug = file.replace(/\.svg$/, "");
    const svg = fs.readFileSync(path.join(dir, file), "utf8");
    const match = svg.match(/<path\s+d="([^"]+)"/);
    if (!match) continue;
    index[slug] = { category: category.name, path: match[1] };
  }
}

fs.writeFileSync(outPath, JSON.stringify(index));
console.log(`Wrote ${Object.keys(index).length} icons to ${path.relative(process.cwd(), outPath)}`);
