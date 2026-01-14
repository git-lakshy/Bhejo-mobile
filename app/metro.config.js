const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolution mapping for event-target-shim
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'event-target-shim': require.resolve('event-target-shim'),
};

module.exports = config;
