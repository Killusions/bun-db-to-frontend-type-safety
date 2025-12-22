module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Compiler - must be first
      [
        'babel-plugin-react-compiler',
        {
          target: '18',
        },
      ],
      // React Native Reanimated - must be last
      'react-native-reanimated/plugin',
    ],
  };
};
