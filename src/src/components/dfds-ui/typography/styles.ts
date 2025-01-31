import { theme, media } from '@/components/dfds-ui/theme'
import { css } from '@emotion/react'

const { fontFamilies, fontSizes, fontWeights, lineHeights } = theme

type BodyProps = {
  size?: keyof typeof theme.fontSizes.body
  weight?: keyof typeof theme.fontWeights.body
  lineHeight?: keyof typeof theme.lineHeights.body
}

type LabelProps = {
  size?: keyof typeof theme.fontSizes.label
  weight?: keyof typeof theme.fontWeights.body
}

type HeadlineProps = {
  size?: keyof typeof theme.fontSizes.headline
  weight?: keyof typeof theme.fontWeights.display
}

type ActionProps = {
  weight?: keyof typeof theme.fontWeights.display
}

const displayFont = css`
  font-family: ${fontFamilies.display};
`

const bodyFont = css`
  font-family: ${fontFamilies.body};
`

const headline = ({ size = 'hero', weight = 'light' }: HeadlineProps) => {
  return css`
    ${displayFont};
    font-weight: ${fontWeights.display[weight]};
    ${size === 'hero'
      ? css`
          font-size: ${fontSizes.headline.hero.mobile};
          line-height: ${lineHeights.headline.hero.mobile};

          ${media.greaterThan('m')`
            font-size: ${fontSizes.headline.hero.desktop};
            line-height: ${lineHeights.headline.hero.desktop};
          `}
        `
      : css`
          font-size: ${fontSizes.headline[size]};
          line-height: ${lineHeights.headline[size]};
        `}
  `
}

const body = ({ weight = 'regular', size = 'medium', lineHeight = 'regular' }: BodyProps) => {
  return css`
    ${bodyFont};
    font-size: ${fontSizes.body[size]};
    font-weight: ${fontWeights.body[weight]};
    line-height: ${lineHeights.body[lineHeight]};
  `
}

const action = ({ weight = 'bold' }: ActionProps) => {
  return css`
    ${displayFont};
    font-size: ${fontSizes.action};
    font-weight: ${fontWeights.display[weight]};
    line-height: ${lineHeights.action};
  `
}

const label = ({ weight = 'regular', size = 'medium' }: LabelProps) => {
  return css`
    ${displayFont};
    font-size: ${fontSizes.label[size]};
    font-weight: ${fontWeights.body[weight]};
    line-height: ${lineHeights.label[size]};
  `
}

const caption = () => {
  return css`
    ${bodyFont};
    font-size: ${fontSizes.caption};
    font-weight: ${fontWeights.body.regular};
    line-height: ${lineHeights.caption};
  `
}

export const typography = {
  heroHeadline: headline({ size: 'hero' }),
  sectionHeadline: headline({ size: 'section', weight: 'bold' }),
  subHeadline: headline({ size: 'sub', weight: 'light' }),
  smallHeadline: headline({ size: 'small', weight: 'bold' }),
  body: body({}),
  bodyBold: body({ weight: 'bold' }),
  bodyInterface: body({ lineHeight: 'interface' }),
  bodyInterfaceBold: body({ weight: 'bold', lineHeight: 'interface' }),
  bodyInterfaceSmall: body({ lineHeight: 'small', size: 'small' }),
  bodyInterfaceSmallBold: body({ lineHeight: 'small', size: 'small', weight: 'bold' }),
  label: label({}),
  labelBold: label({ weight: 'bold' }),
  labelSmall: label({ size: 'small' }),
  action: action({ weight: 'regular' }),
  actionBold: action({ weight: 'bold' }),
  caption: caption(),
}

export default typography
