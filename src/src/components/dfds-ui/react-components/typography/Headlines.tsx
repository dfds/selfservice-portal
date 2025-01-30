import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { legacyMedia as media } from './../styles'
import { theme } from '@dfds-ui/theme'

type HeadlineProps = React.PropsWithoutRef<JSX.IntrinsicElements['h1']> & {
  as?: React.ElementType
  noMargin?: boolean
}

const marginStyles = css`
  margin: 0 0 16px 0;
`

const noMarginStyles = css`
  margin: 0;
`

const headlineStyles = {
  h1: css`
    ${marginStyles};
    color: ${theme.colors.primary.main};
    font-size: 50px;
    font-weight: 300;
    line-height: 1.2;
    ${media.lt('sm')} {
      font-size: 30px;
    }
  `,
  h2: css`
    ${marginStyles};
    font-size: 28px;
    font-weight: bold;
    line-height: 1.2;
  `,
  h3: css`
    ${marginStyles};
    font-size: 26px;
    font-weight: 300;
    line-height: 1.15;
  `,
  h4: css`
    ${marginStyles};
    font-size: 20px;
    font-weight: bold;
    line-height: 1.4;
  `,
}

export const H1 = styled.h1<HeadlineProps>`
  ${headlineStyles.h1}
  ${({ noMargin }) => noMargin && noMarginStyles}
`

export const H2 = styled.h2<HeadlineProps>`
  ${headlineStyles.h2}
  ${({ noMargin }) => noMargin && noMarginStyles}
`

export const H3 = styled.h3<HeadlineProps>`
  ${headlineStyles.h3}
  ${({ noMargin }) => noMargin && noMarginStyles}
`

export const H4 = styled.h4<HeadlineProps>`
  ${headlineStyles.h4}
  ${({ noMargin }) => noMargin && noMarginStyles}
`

export const Headline: React.FunctionComponent<{
  as?: React.ElementType
  styledAs?: keyof typeof headlineStyles
  className?: string
  noMargin?: boolean
}> = ({ as = 'h1', styledAs, className, noMargin, children, ...rest }) => {
  const H = as
  const style = styledAs
    ? styledAs
    : typeof as === 'string' && as in headlineStyles
    ? (as as keyof typeof headlineStyles)
    : 'h1'

  return (
    <H css={[headlineStyles[style], noMargin && noMarginStyles]} className={className} {...rest}>
      {children}
    </H>
  )
}

// Aliases
export const HeroHeadline = H1
export const SectionHeadline = H2
export const SubHeadline = H3
export const SmallHeadline = H4
