import React, { ElementType, FunctionComponent, ReactNode } from 'react'
import { typography } from './styles'

type StyledAs = keyof typeof typography

const Text: FunctionComponent<{
  as?: ElementType
  styledAs?: StyledAs
  className?: string
  children?: ReactNode
}> = ({ as = 'p', children, styledAs = 'body', ...rest }) => {
  const Tag = as
  return (
    <Tag css={typography[styledAs]} {...rest}>
      {children}
    </Tag>
  )
}

export default Text
