/**
 * Generate calendar export icons at different sizes
 * Creates a calendar icon with an export arrow overlay
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Simple function to create an SVG calendar icon with export arrow
function createCalendarExportSVG(size) {
  const strokeWidth = Math.max(1, size / 32);
  const padding = size * 0.1;
  const iconSize = size - (padding * 2);

  // Scale factors for different elements
  const calendarWidth = iconSize * 0.75;
  const calendarHeight = iconSize * 0.75;
  const calendarX = (size - calendarWidth) / 2;
  const calendarY = padding;

  // Arrow dimensions
  const arrowSize = iconSize * 0.35;
  const arrowX = size - arrowSize - padding * 0.5;
  const arrowY = size - arrowSize - padding * 0.5;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Calendar body -->
  <rect x="${calendarX}" y="${calendarY + iconSize * 0.15}"
        width="${calendarWidth}" height="${calendarHeight * 0.85}"
        fill="#4285f4" stroke="#1a73e8" stroke-width="${strokeWidth}" rx="${strokeWidth * 2}"/>

  <!-- Calendar header -->
  <rect x="${calendarX}" y="${calendarY}"
        width="${calendarWidth}" height="${iconSize * 0.2}"
        fill="#1a73e8" rx="${strokeWidth * 2}"/>

  <!-- Calendar rings -->
  <rect x="${calendarX + calendarWidth * 0.2}" y="${calendarY}"
        width="${strokeWidth * 2}" height="${iconSize * 0.15}"
        fill="#1a73e8"/>
  <rect x="${calendarX + calendarWidth * 0.7}" y="${calendarY}"
        width="${strokeWidth * 2}" height="${iconSize * 0.15}"
        fill="#1a73e8"/>

  <!-- Calendar grid lines -->
  <line x1="${calendarX + strokeWidth}" y1="${calendarY + iconSize * 0.4}"
        x2="${calendarX + calendarWidth - strokeWidth}" y2="${calendarY + iconSize * 0.4}"
        stroke="white" stroke-width="${strokeWidth * 0.8}" opacity="0.5"/>
  <line x1="${calendarX + strokeWidth}" y1="${calendarY + iconSize * 0.6}"
        x2="${calendarX + calendarWidth - strokeWidth}" y2="${calendarY + iconSize * 0.6}"
        stroke="white" stroke-width="${strokeWidth * 0.8}" opacity="0.5"/>

  <!-- Export arrow circle background -->
  <circle cx="${arrowX + arrowSize/2}" cy="${arrowY + arrowSize/2}"
          r="${arrowSize/2}" fill="white"/>
  <circle cx="${arrowX + arrowSize/2}" cy="${arrowY + arrowSize/2}"
          r="${arrowSize/2 - strokeWidth/2}" fill="#34a853" stroke="#2d8e47" stroke-width="${strokeWidth}"/>

  <!-- Export arrow -->
  <path d="M ${arrowX + arrowSize * 0.3} ${arrowY + arrowSize * 0.5}
           L ${arrowX + arrowSize * 0.7} ${arrowY + arrowSize * 0.5}
           M ${arrowX + arrowSize * 0.7} ${arrowY + arrowSize * 0.5}
           L ${arrowX + arrowSize * 0.55} ${arrowY + arrowSize * 0.35}
           M ${arrowX + arrowSize * 0.7} ${arrowY + arrowSize * 0.5}
           L ${arrowX + arrowSize * 0.55} ${arrowY + arrowSize * 0.65}"
        stroke="white" stroke-width="${strokeWidth * 1.5}"
        stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
}

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate PNG icons at different sizes
const sizes = [16, 32, 48, 128];

async function generateIcons() {
  for (const size of sizes) {
    const svg = createCalendarExportSVG(size);
    const pngPath = path.join(iconsDir, `icon-${size}.png`);

    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(pngPath);
      console.log(`✓ Created ${pngPath}`);
    } catch (error) {
      console.error(`✗ Failed to create ${pngPath}:`, error.message);
    }
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
