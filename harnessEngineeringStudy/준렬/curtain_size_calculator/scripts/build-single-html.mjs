import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const distDir = join(root, 'dist');
const outputPath = join(root, 'nas-app', 'index.html');

const mimeTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'],
]);

function extensionOf(path) {
  const match = path.match(/\.[a-z0-9]+$/i);
  return match?.[0].toLowerCase() ?? '';
}

async function assetToDataUri(assetPath) {
  const cleanPath = assetPath.replace(/^\//, '');
  const filePath = join(distDir, cleanPath);
  const bytes = await readFile(filePath);
  const mimeType = mimeTypes.get(extensionOf(filePath));

  if (mimeType == null) {
    return assetPath;
  }

  return `data:${mimeType};base64,${bytes.toString('base64')}`;
}

async function inlineAssetsInJavaScript(source) {
  const assetMatches = [...source.matchAll(/(["'`])\/assets\/([^"'`]+?\.(?:jpg|jpeg|png|webp|svg))\1/g)];
  let result = source;

  for (const match of assetMatches) {
    const fullAssetPath = `/assets/${match[2]}`;
    const dataUri = await assetToDataUri(fullAssetPath);
    result = result.replaceAll(`${match[1]}${fullAssetPath}${match[1]}`, `${match[1]}${dataUri}${match[1]}`);
  }

  return result;
}

async function buildSingleHtml() {
  const html = await readFile(join(distDir, 'index.html'), 'utf8');
  const cssMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);
  const jsMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);

  if (cssMatch == null || jsMatch == null) {
    throw new Error('Could not find Vite CSS or JavaScript asset tags in dist/index.html.');
  }

  const css = await readFile(join(distDir, cssMatch[1].replace(/^\//, '')), 'utf8');
  const js = (await inlineAssetsInJavaScript(await readFile(join(distDir, jsMatch[1].replace(/^\//, '')), 'utf8')))
    .replaceAll('</script', '<\\/script');

  const singleHtml = html
    .replace(jsMatch[0], () => `<script type="module">\n${js}\n</script>`)
    .replace(cssMatch[0], () => `<style>\n${css}\n</style>`);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, singleHtml);
  console.log(`Created ${outputPath}`);
}

buildSingleHtml();
