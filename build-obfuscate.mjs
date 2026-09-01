// build-obfuscate.mjs
// Produces an obfuscated copy of the api/ folder only, in ./dist-server/api
// Nothing else (Influxdb, telegraf, node_modules, .env, json files,
// downtime_folder) is touched or copied by this script.
// Run with: npm run build:server

import { globby } from 'globby';
import fs from 'fs-extra';
import path from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';

const SRC_DIR = 'api';
const OUT_DIR = path.join('dist-server', 'api');

const OBFUSCATOR_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  // debugProtection + selfDefending can cause issues with long-running
  // server processes / process managers (pm2, nodemon). Start with these
  // OFF, confirm the server runs cleanly, then turn on cautiously if desired.
  debugProtection: false,
  selfDefending: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  splitStrings: true,
  splitStringsChunkLength: 8,
  // Leave false: transforming object keys can break dynamic property
  // access (req.body[x], mongoose schema fields, route params, etc).
  transformObjectKeys: false,
};

async function build() {
  if (!(await fs.pathExists(SRC_DIR))) {
    console.error(`"${SRC_DIR}" folder not found — nothing to build.`);
    process.exit(1);
  }

  await fs.remove(OUT_DIR);

  const files = await globby(`${SRC_DIR}/**/*`, { dot: true, gitignore: true });

  for (const file of files) {
    // strip the leading "api/" so output lands directly under dist-server/api/...
    const relPath = path.relative(SRC_DIR, file);
    const outPath = path.join(OUT_DIR, relPath);
    await fs.ensureDir(path.dirname(outPath));

    if (file.endsWith('.js') || file.endsWith('.mjs')) {
      const code = await fs.readFile(file, 'utf8');
      const result = JavaScriptObfuscator.obfuscate(code, OBFUSCATOR_OPTIONS);
      await fs.writeFile(outPath, result.getObfuscatedCode());
    } else {
      // covers any non-JS files that might live inside api/ (rare, but safe)
      await fs.copy(file, outPath);
    }
  }

  console.log(`Obfuscated build complete -> ./${OUT_DIR}`);
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
