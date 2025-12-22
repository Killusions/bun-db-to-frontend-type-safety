#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Patching NativeWind v5 for jsx-dev-runtime support...');

const rootDir = path.join(__dirname, '../..');
const nativewindDir = path.join(rootDir, 'node_modules/nativewind');
const packageJsonPath = path.join(nativewindDir, 'package.json');
const jsxRuntimePath = path.join(nativewindDir, 'jsx-dev-runtime.js');

try {
  // Check if nativewind is installed
  if (!fs.existsSync(nativewindDir)) {
    console.log('NativeWind not found, skipping patch');
    return;
  }

  // Create jsx-dev-runtime.js stub file
  const jsxRuntimeContent = `module.exports = require('react/jsx-dev-runtime');\n`;
  fs.writeFileSync(jsxRuntimePath, jsxRuntimeContent);
  console.log('✓ Created jsx-dev-runtime.js stub file');

  // Update package.json exports
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (!pkg.exports['./jsx-dev-runtime']) {
    pkg.exports['./jsx-dev-runtime'] = './jsx-dev-runtime.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('✓ Updated package.json exports');
  } else {
    console.log('✓ package.json already patched');
  }

  console.log('NativeWind v5 patch applied successfully!');
} catch (error) {
  console.error('Failed to patch NativeWind:', error.message);
  process.exit(1);
}
