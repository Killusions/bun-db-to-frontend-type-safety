const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable support for TypeScript and JSX
config.resolver.sourceExts.push('mjs');

// Configure transformer for SVG support
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Remove svg from asset extensions and add to source extensions
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg',
);
config.resolver.sourceExts.push('svg');

// NativeWind v5 configuration
module.exports = withNativewind(config);
