module.exports = {
  '*.js': ['eslint --fix', 'git add'],
  '*.less': ['stylelint --syntax less', 'prettier --write', 'git add'],
  '*.css': ['stylelint ', 'prettier --write', 'git add'],
};
