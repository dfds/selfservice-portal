// In order to use the css prop (without overwriting) on a component inside mdx
// stories we need to provide @mdx-js/loader with a custom renderer function.
// See https://github.com/mdx-js/mdx/tree/master/packages/loader
module.exports = `
import React from 'react'
import { jsx } from '@emotion/react'
import {mdx as _mdx } from '@mdx-js/react'
const mdx = (name, props, ...children) => {
  // Sometimes the mdxType prop can bleed into the DOM from components which "spreads the rest props"
  if(props) {
    // delete props.mdxType
  }
  return (typeof name === 'string' || typeof name === 'symbol') && !(props && 'css' in props) ? _mdx(name, props, ...children) : jsx(name, props, ...children)
}
`
