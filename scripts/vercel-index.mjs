import { copyFile } from 'node:fs/promises';

const browser = new URL('../dist/personas-frontend/browser/', import.meta.url);
await copyFile(new URL('index.csr.html', browser), new URL('index.html', browser));
