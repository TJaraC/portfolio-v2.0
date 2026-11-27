/**
 * Generates the derived image assets (run with `pnpm images` after adding or replacing an
 * image; the outputs are committed, the build does not depend on sharp):
 *
 * 1. Responsive variants `<name>-640w.webp` / `<name>-1280w.webp` next to every case-study
 *    image and the About portraits, so phones stop downloading 2560 px files.
 * 2. `src/data/responsive-images.json`: intrinsic size + available widths per image, used
 *    by ImageWithCurtain to emit srcset/sizes and width/height (no layout shift).
 * 3. Social previews `public/images/og/<projectId>.jpg` at 1200×630 (< 300 KB), cropped
 *    from each published project's hero image.
 */
import { readdir, readFile, rm, stat, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = join(root, 'public');
const VARIANT_WIDTHS = [640, 1280];
const VARIANT_PATTERN = /-\d+w\.webp$/;
const SOURCE_DIRECTORIES = [join(publicDirectory, 'images', 'projects')];
const EXTRA_SOURCES = [
  join(publicDirectory, 'images', 'general', 'profile01.webp'),
  join(publicDirectory, 'images', 'general', 'profile02.webp'),
];
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    })
  );
  return files.flat();
};

const toPublicUrl = (path) => `/${relative(publicDirectory, path).split(sep).join('/')}`;
const variantPath = (path, width) => path.replace(/\.webp$/, `-${width}w.webp`);

const sources = [
  ...(await Promise.all(SOURCE_DIRECTORIES.map(walk))).flat(),
  ...EXTRA_SOURCES,
]
  .filter((path) => path.endsWith('.webp') && !VARIANT_PATTERN.test(path))
  .sort();

const manifest = {};
let generated = 0;

for (const source of sources) {
  const { width, height } = await sharp(source).metadata();
  const widths = VARIANT_WIDTHS.filter((candidate) => candidate < width * 0.85);

  for (const variantWidth of VARIANT_WIDTHS) {
    const destination = variantPath(source, variantWidth);
    if (!widths.includes(variantWidth)) {
      await rm(destination, { force: true });
      continue;
    }
    const sourceStat = await stat(source);
    const existing = await stat(destination).catch(() => null);
    if (existing && existing.mtimeMs >= sourceStat.mtimeMs) continue;

    await sharp(source)
      .resize({ width: variantWidth })
      .webp({ quality: 80, effort: 6 })
      .toFile(destination);
    generated += 1;
  }

  manifest[toPublicUrl(source)] = { width, height, widths };
}

const manifestPath = join(root, 'src', 'data', 'responsive-images.json');
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

// Social previews for the published case studies
const projectIds = JSON.parse(
  await readFile(join(root, 'src', 'data', 'published-projects.json'), 'utf8')
);
const ogDirectory = join(publicDirectory, 'images', 'og');
await mkdir(ogDirectory, { recursive: true });

for (const projectId of projectIds) {
  const project = JSON.parse(
    await readFile(join(root, 'src', 'data', 'projects', `${projectId}.json`), 'utf8')
  );
  const destination = join(ogDirectory, `${projectId}.jpg`);
  await sharp(join(publicDirectory, project.heroImage))
    .resize({ width: OG_WIDTH, height: OG_HEIGHT, fit: 'cover', position: 'centre' })
    .flatten({ background: '#131313' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(destination);
  const { size } = await stat(destination);
  if (size > 300 * 1024) {
    throw new Error(`${toPublicUrl(destination)} is ${Math.round(size / 1024)} KB (> 300 KB).`);
  }
}

console.log(
  `Images: ${sources.length} sources, ${generated} variants written, ${projectIds.length} social previews.`
);
