import React, { ElementType, ReactNode } from 'react'

// TODO: The idea of this components is to wrap markup intended for readability. Like margins on paragraphs etc
export interface TypographyProps {
  className?: string
  children?: ReactNode
  as?: ElementType
}

export const Typography = ({ className, as = 'div', ...rest }: TypographyProps) => {
  const Component = as
  return <Component className={className} {...rest} />
}

export default Typography
