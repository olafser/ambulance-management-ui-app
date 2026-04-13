import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const GENERATED_CLIENT_ROOT = join(process.cwd(), 'src', 'api', 'ambulance-management');
const TS_NOCHECK_HEADER = '// @ts-nocheck\n';
const EXCLUDED_FILES = new Set(['client.ts', 'index.ts', 'runtime.ts']);

const collectTypeScriptFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectTypeScriptFiles(fullPath);
      }

      if (!entry.isFile() || !entry.name.endsWith('.ts') || EXCLUDED_FILES.has(entry.name)) {
        return [];
      }

      return [fullPath];
    }),
  );

  return files.flat();
};

const ensureTsNoCheckHeader = async (filePath) => {
  const source = await readFile(filePath, 'utf8');
  if (source.startsWith(TS_NOCHECK_HEADER)) {
    return;
  }

  await writeFile(filePath, `${TS_NOCHECK_HEADER}${source}`, 'utf8');
};

const files = await collectTypeScriptFiles(GENERATED_CLIENT_ROOT);
await Promise.all(files.map(ensureTsNoCheckHeader));
