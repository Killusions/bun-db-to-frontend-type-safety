const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable support for TypeScript and JSX
config.resolver.sourceExts.push('mjs');

// Add support for CSS imports
config.resolver.assetExts.push('css');

// Configure transformer for better performance
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  unstable_allowRequireContext: true,
};

config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// Add support for React Compiler and NativeWind v4
module.exports = withNativeWind(config, { input: './global.css' });