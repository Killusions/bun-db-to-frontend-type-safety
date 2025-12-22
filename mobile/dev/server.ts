import { spawn } from 'bun';
import { existsSync } from 'fs';
import { join } from 'path';

const MOBILE_DIR = process.cwd();
const ROOT_DIR = join(MOBILE_DIR, '..');

interface ServerOptions {
  platform?: 'web' | 'android' | 'ios';
  port?: number;
  host?: string;
  tunnel?: boolean;
  clear?: boolean;
}

async function checkBackendServer() {
  try {
    const response = await fetch('http://localhost:3000/api');
    return response.ok;
  } catch {
    return false;
  }
}

async function startBackendServer() {
  console.log('🚀 Starting backend server...');

  const backendProcess = spawn({
    cmd: ['bun', 'run', 'start'],
    cwd: ROOT_DIR,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  // Wait a bit for the server to start
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const isRunning = await checkBackendServer();
  if (!isRunning) {
    console.warn('⚠️  Backend server may not have started properly');
  } else {
    console.log('✅ Backend server is running');
  }

  return backendProcess;
}

async function startExpoDevServer(options: ServerOptions) {
  console.log('📱 Starting Expo development server...');

  const args = ['expo', 'start'];

  // Add platform-specific flags
  if (options.platform === 'web') {
    args.push('--web');
  } else if (options.platform === 'android') {
    args.push('--android');
  } else if (options.platform === 'ios') {
    args.push('--ios');
  }

  // Add port if specified
  if (options.port) {
    args.push('--port', options.port.toString());
  }

  // Add host if specified
  if (options.host) {
    args.push('--host', options.host);
  }

  // Add tunnel flag
  if (options.tunnel) {
    args.push('--tunnel');
  }

  // Add clear cache flag
  if (options.clear) {
    args.push('--clear');
  }

  const expoProcess = spawn({
    cmd: ['bun', ...args],
    cwd: MOBILE_DIR,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  return expoProcess;
}

async function prebuildIfNeeded() {
  const androidExists = existsSync(join(MOBILE_DIR, 'android'));
  const iosExists = existsSync(join(MOBILE_DIR, 'ios'));

  if (!androidExists || !iosExists) {
    console.log('🔧 Running prebuild to generate native directories...');

    const prebuildProcess = spawn({
      cmd: ['bun', 'expo', 'prebuild'],
      cwd: MOBILE_DIR,
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    await new Promise<void>((resolve, reject) => {
      prebuildProcess.exited.then((code) => {
        if (code === 0) {
          console.log('✅ Prebuild completed successfully');
          resolve();
        } else {
          console.error('❌ Prebuild failed');
          reject(new Error('Prebuild failed'));
        }
      });
    });
  }
}

async function runDevServer(options: ServerOptions = {}) {
  console.log('🏗️  Simple Server Mobile - Development Server');
  console.log('===============================================');

  try {
    // Check if backend is running
    const backendRunning = await checkBackendServer();
    let backendProcess: any;

    if (!backendRunning) {
      console.log('🔄 Backend server not detected, starting it...');
      backendProcess = await startBackendServer();
    } else {
      console.log('✅ Backend server is already running');
    }

    // Prebuild if needed
    await prebuildIfNeeded();

    // Start Expo dev server
    const expoProcess = await startExpoDevServer(options);

    // Handle graceful shutdown
    const cleanup = () => {
      console.log('\n🛑 Shutting down development servers...');

      if (expoProcess) {
        expoProcess.kill();
      }

      if (backendProcess) {
        backendProcess.kill();
      }

      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Wait for processes to finish
    await Promise.race([
      new Promise<void>((resolve) => {
        expoProcess.exited.then(() => {
          console.log('📱 Expo dev server stopped');
          resolve();
        });
      }),
      backendProcess
        ? new Promise<void>((resolve) => {
            backendProcess.exited.then(() => {
              console.log('🚀 Backend server stopped');
              resolve();
            });
          })
        : Promise.resolve(),
    ]);
  } catch (error) {
    console.error('❌ Development server failed to start:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: ServerOptions = {};

// Parse platform
const platformArg = args.find((arg) =>
  ['--web', '--android', '--ios'].includes(arg),
);
if (platformArg) {
  options.platform = platformArg.slice(2) as ServerOptions['platform'];
}

// Parse port
const portIndex = args.indexOf('--port');
if (portIndex !== -1 && args[portIndex + 1]) {
  options.port = parseInt(args[portIndex + 1]);
}

// Parse host
const hostIndex = args.indexOf('--host');
if (hostIndex !== -1 && args[hostIndex + 1]) {
  options.host = args[hostIndex + 1];
}

// Parse flags
options.tunnel = args.includes('--tunnel');
options.clear = args.includes('--clear');

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Simple Server Mobile - Development Server

Usage: bun run dev/server.ts [options]

Options:
  --web           Start for web platform
  --android       Start for Android platform  
  --ios           Start for iOS platform
  --port <number> Specify port (default: 8081)
  --host <string> Specify host
  --tunnel        Enable tunneling
  --clear         Clear cache
  --help, -h      Show this help message

Examples:
  bun run dev/server.ts --web --port 3001
  bun run dev/server.ts --android --clear
  bun run dev/server.ts --tunnel
`);
  process.exit(0);
}

// Run the development server
runDevServer(options);
