module.exports.DEVELOPMENT = 'development';

module.exports.PRODUCTION = 'production';

module.exports.HASH_DIGEST_LENGTH = 6;

const NODE_MODULES = '[\\/]node_modules[\\/]';

const MODULE_NAME = '(.*?)([\\\\/]|$)';

module.exports.NODE_MODULES_REG = new RegExp(NODE_MODULES);

module.exports.NODE_MODULES_WITH_NAME_REG = new RegExp(
  NODE_MODULES + MODULE_NAME,
);
