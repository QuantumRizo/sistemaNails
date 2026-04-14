module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@muymuy/types': '../../packages/types/index.ts',
          '@muymuy/logic': '../../packages/logic/index.ts',
        },
      }],
      'react-native-reanimated/plugin',
    ],
  }
}
