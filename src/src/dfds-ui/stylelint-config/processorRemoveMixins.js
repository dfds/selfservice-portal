// Found this while reading at https://github.com/bbc/simorgh/issues/2189
// It was needed after introducing stylelint-csstree-validator

// If this proposed functionality ever gets added https://github.com/styled-components/stylelint-processor-styled-components/issues/271
// then please delete this processor and any use of it.
module.exports = () => ({
  code: (input) => input.replace(/-styled-mixin\d+:\s.+(?!{|,).$/gm, `/* styled-mixin */`),
})
