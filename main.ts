#!/usr/bin/env node
/**
 * Vice District - Open World Crime Game
 * Entry for make.fun "Make GTA 6" bounty (gta6-01)
 * 
 * Start: node main.ts
 * Play: Open http://localhost:3000 in browser
 */

import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const PORT = parseInt(process.env.PORT || '3000', 10);
const GAME_DIR = join(__dirname, 'game');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
};

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let path = url.pathname === '/' ? '/index.html' : url.pathname;
  
  // Security: prevent directory traversal
  const safePath = join(GAME_DIR, path.replace(/\.\./g, ''));
  if (!safePath.startsWith(GAME_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  if (!existsSync(safePath) || statSync(safePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  const ext = extname(safePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  try {
    const content = readFileSync(safePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(content);
  } catch (err) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port with PORT=<number>`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║   ██████╗ ███████╗██████╗  ██████╗ ██████╗               ║');
  console.log('║   ██╔══██╗██╔════╝██╔══██╗██╔═══██╗██╔══██╗              ║');
  console.log('║   ██████╔╝█████╗  ██████╔╝██║   ██║██████╔╝              ║');
  console.log('║   ██╔══██╗██╔══╝  ██╔══██╗██║   ██║██╔══██╗              ║');
  console.log('║   ██║  ██║███████╗██║  ██║╚██████╔╝██║  ██║              ║');
  console.log('║   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝              ║');
  console.log('║                                                            ║');
  console.log('║              VICE DISTRICT - Open World Crime Game          ║');
  console.log('║                                                            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open in browser to play!`);
  console.log('');
  console.log('Controls:');
  console.log('  WASD - Move');
  console.log('  Mouse - Look');
  console.log('  Click - Shoot');
  console.log('  E - Interact');
  console.log('  F - Enter/Exit Vehicle');
  console.log('  Space - Jump');
  console.log('  Shift - Sprint');
  console.log('  P - Pause');
  console.log('  1-5 - Switch Weapon');
  console.log('  M - Start Mission');
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});
