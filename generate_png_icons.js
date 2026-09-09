import fs from 'fs';
import sharp from 'sharp';

async function generate() {
  const svg = fs.readFileSync('public/icon.svg');
  await sharp(svg).resize(512, 512).png().toFile('public/pwa-512x512.png');
  await sharp(svg).resize(192, 192).png().toFile('public/pwa-192x192.png');
  await sharp(svg).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(svg).resize(32, 32).png().toFile('public/favicon.ico');
  console.log('App icons generated successfully from public/icon.svg');
}

generate().catch(console.error);
