import { spawnSync } from 'bun';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const MOBILE_DIR = process.cwd();
const ANDROID_DIR = join(MOBILE_DIR, 'android');
const IOS_DIR = join(MOBILE_DIR, 'ios');

interface PrebuildOptions {
  platform?: 'android' | 'ios' | 'all';
  clean?: boolean;
  template?: string;
}

async function cleanExistingBuilds(options: PrebuildOptions) {
  if (!options.clean) return;

  console.log('🧹 Cleaning existing native directories...');

  if (options.platform === 'android' || options.platform === 'all') {
    if (existsSync(ANDROID_DIR)) {
      rmSync(ANDROID_DIR, { recursive: true, force: true });
      console.log('  ✅ Removed android directory');
    }
  }

  if (options.platform === 'ios' || options.platform === 'all') {
    if (existsSync(IOS_DIR)) {
      rmSync(IOS_DIR, { recursive: true, force: true });
      console.log('  ✅ Removed ios directory');
    }
  }
}

async function runPrebuild(options: PrebuildOptions) {
  console.log('🔧 Running Expo prebuild...');

  const args = ['expo', 'prebuild'];

  // Add platform-specific flags
  if (options.platform && options.platform !== 'all') {
    args.push('--platform', options.platform);
  }

  // Add clean flag if specified
  if (options.clean) {
    args.push('--clean');
  }

  // Add template if specified
  if (options.template) {
    args.push('--template', options.template);
  }

  // Skip dependency installation (we'll handle with bun)
  args.push('--skip-dependency-update');

  const result = spawnSync({
    cmd: ['bun', ...args],
    cwd: MOBILE_DIR,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  if (result.exitCode !== 0) {
    throw new Error('Expo prebuild failed');
  }
}

async function installNativeDependencies(options: PrebuildOptions) {
  // Install Android dependencies
  if (
    (options.platform === 'android' || options.platform === 'all') &&
    existsSync(ANDROID_DIR)
  ) {
    console.log('📦 Setting up Android dependencies...');

    // Android dependencies are handled by Gradle
    console.log('  ✅ Android Gradle will handle dependencies');
  }

  // Install iOS dependencies
  if (
    (options.platform === 'ios' || options.platform === 'all') &&
    existsSync(IOS_DIR)
  ) {
    console.log('📦 Installing iOS CocoaPods dependencies...');

    const podResult = spawnSync({
      cmd: ['pod', 'install'],
      cwd: IOS_DIR,
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    if (podResult.exitCode !== 0) {
      console.warn(
        '⚠️  CocoaPods installation failed. You may need to run "pod install" manually.',
      );
    } else {
      console.log('  ✅ CocoaPods dependencies installed');
    }
  }
}

async function verifyPrebuild(options: PrebuildOptions) {
  console.log('🔍 Verifying prebuild results...');

  let success = true;

  if (options.platform === 'android' || options.platform === 'all') {
    if (existsSync(join(ANDROID_DIR, 'build.gradle'))) {
      console.log('  ✅ Android project generated successfully');
    } else {
      console.error('  ❌ Android project generation failed');
      success = false;
    }
  }

  if (options.platform === 'ios' || options.platform === 'all') {
    if (existsSync(join(IOS_DIR, 'SimpleServerMobile.xcworkspace'))) {
      console.log('  ✅ iOS project generated successfully');
    } else if (existsSync(join(IOS_DIR, 'SimpleServerMobile.xcodeproj'))) {
      console.log('  ✅ iOS project generated successfully');
    } else {
      console.error('  ❌ iOS project generation failed');
      success = false;
    }
  }

  return success;
}

async function runPrebuildProcess(options: PrebuildOptions = {}) {
  console.log('🏗️  Simple Server Mobile - Prebuild');
  console.log('===================================');

  try {
    // Set default platform
    if (!options.platform) {
      options.platform = 'all';
    }

    // Clean existing builds if requested
    await cleanExistingBuilds(options);

    // Run expo prebuild
    await runPrebuild(options);

    // Install native dependencies
    await installNativeDependencies(options);

    // Verify the prebuild
    const success = await verifyPrebuild(options);

    if (success) {
      console.log('\n🎉 Prebuild completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('  • For Android: bun run mobile:build:android');
      console.log('  • For iOS: bun run mobile:build:ios');
      console.log('  • For development: bun run mobile:start');
    } else {
      console.error('\n❌ Prebuild completed with errors');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Prebuild failed:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: PrebuildOptions = {};

// Parse platform
if (args.includes('--android')) {
  options.platform = 'android';
} else if (args.includes('--ios')) {
  options.platform = 'ios';
} else if (args.includes('--all')) {
  options.platform = 'all';
}

// Parse flags
options.clean = args.includes('--clean');

// Parse template
const templateIndex = args.indexOf('--template');
if (templateIndex !== -1 && args[templateIndex + 1]) {
  options.template = args[templateIndex + 1];
}

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Simple Server Mobile - Prebuild

Usage: bun run dev/prebuild.ts [options]

Options:
  --android       Prebuild for Android only
  --ios           Prebuild for iOS only  
  --all           Prebuild for all platforms (default)
  --clean         Clean existing native directories
  --template <name> Use specific template
  --help, -h      Show this help message

Examples:
  bun run dev/prebuild.ts --clean
  bun run dev/prebuild.ts --android --clean
  bun run dev/prebuild.ts --ios
  bun run dev/prebuild.ts --template bare-minimum
`);
  process.exit(0);
}

// Run the prebuild
runPrebuildProcess(options);
