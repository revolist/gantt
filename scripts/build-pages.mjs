import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const defaultRoot = resolve(import.meta.dirname, '..');

function legacyDemoRedirect(feature) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="canonical" href="${feature.liveDemoUrl}" />
    <title>${feature.title}</title>
    <script>
      const target = new URL('../', window.location.href);
      target.search = window.location.search;
      target.hash = window.location.hash;
      window.location.replace(target);
    </script>
    <noscript><meta http-equiv="refresh" content="0; url=../" /></noscript>
  </head>
  <body>
    <p><a href="../">Open the ${feature.title} demo</a></p>
  </body>
</html>
`;
}

export async function assemblePages(options = {}) {
  const root = options.root ?? defaultRoot;
  const output = options.output ?? join(root, 'pages-dist');
  const feature = options.feature ?? JSON.parse(await readFile(join(root, 'feature.json'), 'utf8'));
  const demoUrl = new URL(feature.liveDemoUrl);

  await rm(output, { recursive: true, force: true });
  await cp(join(root, feature.demoOutput), output, { recursive: true });
  await mkdir(join(output, 'demo'), { recursive: true });
  await writeFile(join(output, 'demo', 'index.html'), legacyDemoRedirect(feature));
  await writeFile(join(output, 'CNAME'), `${demoUrl.hostname}\n`);

  console.log(`GitHub Pages artifact assembled at ${output}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await assemblePages();
}
