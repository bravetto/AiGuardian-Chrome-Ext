// Simple script to create placeholder PNG icons for Chrome extension
const fs = require('fs');
const path = require('path');

// Create a simple 1x1 PNG data URL and scale it (this is a basic approach)
function createSimplePNG(size, color) {
  // This creates a very basic placeholder - in production you'd want proper PNG files
  // For now, we'll create a simple colored square as a placeholder

  // Create a simple colored square using a data URL approach
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');

  // Set background color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Add simple text
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size/4}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('AI', size/2, size/2 + size/8);

  return c.toBuffer('image/png');
}

try {
  // Create placeholder icons
  const sizes = [16, 32, 48, 128];
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0']; // Different colors for each size

  sizes.forEach((size, index) => {
    const filename = `icon${size}.png`;
    const color = colors[index % colors.length];

    console.log(`Creating ${filename}...`);
    const pngBuffer = createSimplePNG(size, color);
    fs.writeFileSync(filename, pngBuffer);
    console.log(`✅ Created ${filename}`);
  });

  console.log('All placeholder icons created successfully!');
} catch (error) {
  console.error('Error creating icons:', error.message);
  console.log('Falling back to creating empty files...');

  // Fallback: create empty files so manifest doesn't fail
  const sizes = [16, 32, 48, 128];
  sizes.forEach(size => {
    const filename = `icon${size}.png`;
    try {
      fs.writeFileSync(filename, ''); // Empty file
      console.log(`Created empty placeholder: ${filename}`);
    } catch (err) {
      console.error(`Failed to create ${filename}:`, err.message);
    }
  });
}
