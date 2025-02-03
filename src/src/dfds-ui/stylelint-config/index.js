module.exports = {
  processors: ['stylelint-processor-styled-components', './processorRemoveMixins.js'],
  extends: ['stylelint-config-prettier', 'stylelint-config-styled-components'],
  plugins: ['stylelint-csstree-validator'],
  rules: {
    'no-descending-specificity': null,
    'declaration-no-important': true,
    'csstree/validator': {
      syntaxExtensions: ['sass'],
      ignoreAtrules: ['custom-at-rule', 'keyframes'],
    },
  },
}
