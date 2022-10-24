module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: { version: 3 },
        modules: false,
      },
    ],
  ],
};
