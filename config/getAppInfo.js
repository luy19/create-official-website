const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

const gitHEAD = fs
  .readFileSync(path.join(__dirname, '../.git/HEAD'), 'utf-8')
  .trim();
const [, ref, branch] = gitHEAD.match(/^ref: (refs\/heads\/(\S+))$/);
const revision = fs
  .readFileSync(path.join(__dirname, `../.git/${ref}`), 'utf-8')
  .trim();
const buildTime = new Date().toLocaleString('zh', { hour12: false });

module.exports = {
  version,
  branch,
  revision,
  buildTime,
};
