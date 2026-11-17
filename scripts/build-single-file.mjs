import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const distDir = path.join(root, 'dist');
const distHtml = path.join(distDir, 'index.html');
const output = path.join(root, 'Tiendo-Studio.html');

let html = fs.readFileSync(distHtml, 'utf8');

// Vite ho tro modulepreload; khong can trong ban dong goi 1 file
html = html.replace(/<link\s+rel="modulepreload"[^>]*>/g, '');

// Nhet toan bo JS (module) vao trong index.html
html = html.replace(
  /<script\b([^>]*?)src="([^"]+)"([^>]*?)>\s*<\/script>/g,
  (full, _before, src, _after) => {
    if (!/\.js(?:\?|$)/.test(src)) return full;
    const file = path.join(distDir, src.replace(/^\.?\//, ''));
    const code = fs
      .readFileSync(file, 'utf8')
      .replace(/<\/script>/gi, '<\\/script>');
    return `<script type="module">\n${code}\n</script>`;
  }
);

// Nhet CSS vao trong index.html (giu nguyen link font tu Google)
html = html.replace(
  /<link\b([^>]*?)href="([^"]+)"([^>]*?)\/?>/g,
  (full, _before, href, _after) => {
    if (/^(?:https?:)?\/\//.test(href)) return full;
    if (!/\.css(?:\?|$)/.test(href)) return full;
    const file = path.join(distDir, href.replace(/^\.?\//, ''));
    const css = fs
      .readFileSync(file, 'utf8')
      .replace(/<\/style>/gi, '<\\/style>');
    return `<style>\n${css}\n</style>`;
  }
);

fs.writeFileSync(output, html, 'utf8');
const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`Da tao: ${output} (${sizeKb} KB)`);
