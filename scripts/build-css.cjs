// scripts/build-css.cjs
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindPostcss = require('@tailwindcss/postcss');
let autoprefixer;
try {
  autoprefixer = require('autoprefixer');
} catch (e) {
  autoprefixer = null;
}

async function build() {
  const root = path.resolve(__dirname, '..');
  const input = path.join(root, 'src', 'index.css');
  const outDir = path.join(root, 'dist');
  const outFile = path.join(outDir, 'tailwind.css');

  if (!fs.existsSync(input)) {
    console.error('Error: src/index.css not found at', input);
    process.exit(1);
  }
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // If you have a tailwind config at project root, pass it to the plugin
  const configPath = fs.existsSync(path.join(root, 'tailwind.config.cjs'))
    ? path.join(root, 'tailwind.config.cjs')
    : undefined;

  const css = fs.readFileSync(input, 'utf8');

  const plugins = [
    tailwindPostcss(configPath ? { config: configPath } : {})
  ];
  if (autoprefixer) plugins.push(autoprefixer());

  try {
    const result = await postcss(plugins).process(css, {
      from: input,
      to: outFile,
      map: { inline: false }
    });
    fs.writeFileSync(outFile, result.css, 'utf8');
    if (result.map) fs.writeFileSync(outFile + '.map', result.map.toString(), 'utf8');
    console.log('Built', outFile);
    process.exit(0);
  } catch (err) {
    console.error('PostCSS/Tailwind build failed:\n', err);
    process.exit(2);
  }
}

build();
