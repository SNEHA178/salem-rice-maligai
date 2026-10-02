import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('Created pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('Created pwa-512x512.png');

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('Created apple-touch-icon.png');

  // Maskable icon with 15% safe zone padding around
  const innerSize = Math.round(512 * 0.75); // 384
  const padding = Math.round((512 - innerSize) / 2); // 64
  const resizedInner = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 22, g: 64, b: 42, alpha: 1 } // #16402A
    }
  })
    .composite([{ input: resizedInner, top: padding, left: padding }])
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('Created pwa-maskable-512x512.png');

  // Favicon 64x64
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.ico');
  console.log('Created favicon.ico');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
