import { spawnSync } from 'bun';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const MOBILE_DIR = process.cwd();
const BUILD_DIR = join(MOBILE_DIR, 'builds');
const ANDROID_DIR = join(MOBILE_DIR, 'android');
const IOS_DIR = join(MOBILE_DIR, 'ios');

// Ensure builds directory exists
if (!existsSync(BUILD_DIR)) {
  mkdirSync(BUILD_DIR, { recursive: true });
}

interface BuildOptions {
  platform: 'android' | 'ios' | 'web' | 'all';
  mode: 'development' | 'release';
  clean?: boolean;
}

async function buildAndroid(
  mode: 'development' | 'release',
  clean: boolean = false,
) {
  console.log('🤖 Building Android app...');

  // Prebuild if android directory doesn't exist or clean flag is set
  if (!existsSync(ANDROID_DIR) || clean) {
    console.log('🔧 Prebuilding Android project...');
    const prebuildResult = spawnSync({
      cmd: ['bun', 'expo', 'prebuild', '--platform', 'android', '--clean'],
      cwd: MOBILE_DIR,
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    if (prebuildResult.exitCode !== 0) {
      throw new Error('Android prebuild failed');
    }
  }

  // Build the APK
  const buildCommand =
    mode === 'release'
      ? ['./gradlew', 'assembleRelease']
      : ['./gradlew', 'assembleDebug'];

  const buildResult = spawnSync({
    cmd: buildCommand,
    cwd: ANDROID_DIR,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  if (buildResult.exitCode !== 0) {
    throw new Error('Android build failed');
  }

  // Copy APK to builds directory
  const apkPath =
    mode === 'release'
      ? join(ANDROID_DIR, 'app/build/outputs/apk/release/app-release.apk')
      : join(ANDROID_DIR, 'app/build/outputs/apk/debug/app-debug.apk');

  const targetApkPath = join(BUILD_DIR, `simple-server-mobile-${mode}.apk`);

  if (existsSync(apkPath)) {
    const copyResult = spawnSync({
      cmd: ['cp', apkPath, targetApkPath],
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    if (copyResult.exitCode === 0) {
      console.log(
        `✅ Android ${mode} APK built successfully: ${targetApkPath}`,
      );
    } else {
      console.error('❌ Failed to copy APK to builds directory');
    }
  } else {
    console.error('❌ APK not found at expected location');
  }
}

async function buildIOS(
  mode: 'development' | 'release',
  clean: boolean = false,
) {
  console.log('🍎 Building iOS app...');

  // Check if we're on macOS
  const osCheck = spawnSync({
    cmd: ['uname'],
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  if (osCheck.stdout?.toString().trim() !== 'Darwin') {
    throw new Error('iOS builds can only be performed on macOS');
  }

  // Prebuild if ios directory doesn't exist or clean flag is set
  if (!existsSync(IOS_DIR) || clean) {
    console.log('🔧 Prebuilding iOS project...');
    const prebuildResult = spawnSync({
      cmd: ['bun', 'expo', 'prebuild', '--platform', 'ios', '--clean'],
      cwd: MOBILE_DIR,
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    if (prebuildResult.exitCode !== 0) {
      throw new Error('iOS prebuild failed');
    }
  }

  // Install CocoaPods dependencies
  console.log('🔗 Installing CocoaPods dependencies...');
  const podResult = spawnSync({
    cmd: ['pod', 'install'],
    cwd: IOS_DIR,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  if (podResult.exitCode !== 0) {
    throw new Error('CocoaPods installation failed');
  }

  // Build and archive
  const configuration = mode === 'release' ? 'Release' : 'Debug';
  const archivePath = join(BUILD_DIR, 'SimpleServerMobile.xcarchive');

  const archiveResult = spawnSync({
    cmd: [
      'xcodebuild',
      'archive',
      '-workspace',
      'SimpleServerMobile.xcworkspace',
      '-scheme',
      'SimpleServerMobile',
      '-configuration',
      configuration,
      '-archivePath',
      archivePath,
      '-allowProvisioningUpdates',
    ],
    cwd: IOS_DIR,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  if (archiveResult.exitCode !== 0) {
    throw new Error('iOS archive failed');
  }

  console.log(`✅ iOS ${mode} archive built successfully: ${archivePath}`);
}

async function buildWeb(mode: 'development' | 'release') {
  console.log('🌐 Building web app...');

  const webBuildDir = join(MOBILE_DIR, 'dist/web');

  const buildResult = spawnSync({
    cmd: [
      'bun',
      'expo',
      'export',
      '--platform',
      'web',
      '--output-dir',
      webBuildDir,
      mode === 'release' ? '--minify' : '',
    ].filter(Boolean),
    cwd: MOBILE_DIR,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  if (buildResult.exitCode !== 0) {
    throw new Error('Web build failed');
  }

  // Create tarball
  const tarballPath = join(
    BUILD_DIR,
    `simple-server-mobile-web-${mode}.tar.gz`,
  );
  const tarResult = spawnSync({
    cmd: ['tar', '-czf', tarballPath, '-C', webBuildDir, '.'],
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  if (tarResult.exitCode === 0) {
    console.log(`✅ Web ${mode} build completed: ${tarballPath}`);
  } else {
    console.error('❌ Failed to create web build tarball');
  }
}

async function runBuild(options: BuildOptions) {
  console.log(
    `🚀 Starting ${options.platform} build in ${options.mode} mode...`,
  );

  try {
    if (options.platform === 'android' || options.platform === 'all') {
      await buildAndroid(options.mode, options.clean);
    }

    if (options.platform === 'ios' || options.platform === 'all') {
      await buildIOS(options.mode, options.clean);
    }

    if (options.platform === 'web' || options.platform === 'all') {
      await buildWeb(options.mode);
    }

    console.log('🎉 Build completed successfully!');

    // List build outputs
    console.log('\n📁 Build outputs:');
    const lsResult = spawnSync({
      cmd: ['ls', '-la', BUILD_DIR],
      stdio: ['ignore', 'pipe', 'inherit'],
    });
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const platform =
  (args.find((arg) =>
    ['android', 'ios', 'web', 'all'].includes(arg),
  ) as BuildOptions['platform']) || 'all';
const mode = args.includes('--release') ? 'release' : 'development';
const clean = args.includes('--clean');

// Run the build
runBuild({ platform, mode, clean });
