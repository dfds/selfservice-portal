import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import { typography } from '@/dfds-ui/typography/src'
import { Text } from '@/dfds-ui/typography/src'

type FontFamily = keyof typeof theme.fontFamilies

type StyledAs = keyof Pick<
  typeof typography,
  | 'body'
  | 'bodyBold'
  | 'action'
  | 'actionBold'
  | 'label'
  | 'labelBold'
  | 'labelSmall'
  | 'caption'
  | 'sectionHeadline'
  | 'subHeadline'
  | 'smallHeadline'
>

export type ListTextProps = {
  /**
   * Set the style of the text.
   */
  styledAs?: StyledAs

  /**
   * Override the default color from `styledAs`.
   */
  color?: string

  children?: React.ReactNode

  /**
   * *DEPRECATED* use `styledAs` instead or override size with `css` prop or `className`.
   *
   * Choose the font size.
   * @deprecated
   */
  size?: string

  /**
   * *DEPRECATED* use `styledAs` instead or override fontWeight with `css` prop or `className`.
   *
   * Choose the font weight.
   * @deprecated
   */
  fontWeight?: number

  /**
   * *DEPRECATED* use `styledAs` instead or override fontFamily with `css` prop or `className`.
   *
   * Choose the font family.
   * @deprecated
   */
  fontFamily?: FontFamily
}

function textStyles(styledAs: StyledAs) {
  let lineHeight = 'inherit'
  let color = theme.colors.text.dark.primary
  switch (styledAs) {
    case 'action':
    case 'actionBold':
      lineHeight = '20px'
      color = 'currentColor'
      break
    case 'label':
    case 'labelBold':
    case 'labelSmall':
    case 'body':
    case 'bodyBold':
      lineHeight = '20px'
      color = theme.colors.primary.main
  }
  return css`
    color: ${color};
    line-height: ${lineHeight};
  `
}

function deprecated({ fontWeight, size, fontFamily }: Partial<ListTextProps>) {
  if (fontWeight || size || fontFamily) {
    // TODO: Figure out how to handle deprecation
    // console.warn('deprecated')
  }
  return css`
    font-weight: ${fontWeight};
    font-size: ${size};
    font-family: ${fontFamily && (theme.fontFamilies[fontFamily] || fontFamily)};
  `
}

const ListText = ({ styledAs = 'body', color, fontWeight, size, fontFamily, ...rest }: ListTextProps) => {
  return (
    <Text
      as="span"
      styledAs={styledAs}
      css={css`
        flex: 1;
        flex-basis: auto;
        user-select: none;
        white-space: normal;
        user-select: none;
        margin: 0;
        &:not(:last-child) {
          margin-right: ${theme.spacing.xs};
        }
        & span {
          margin-left: 0;
        }
        ${textStyles(styledAs)}
        ${deprecated({ fontWeight, size, fontFamily })}
        color: ${color};
      `}
      {...rest}
    />
  )
}

export default ListText
