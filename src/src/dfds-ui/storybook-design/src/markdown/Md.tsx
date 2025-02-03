import React from 'react'
import Markdown from './Markdown'

export const Md = (strings: TemplateStringsArray, ...values: string[]) => {
  const source = strings.reduce((res, str, i) => {
    return `${res}${str}${values[i] || ''}`
  })

  return <Markdown>{source}</Markdown>
}

export default Md
