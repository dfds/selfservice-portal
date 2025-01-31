import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import { typography } from '@/components/dfds-ui/typography'
import { Button } from '../../button'
import { BannerVariant, useBannerContext } from './Banner'

export type BannerActionVariation = 'primary' | 'secondary' | 'primary-thick' | 'secondary-thick'

export interface BannerActionProps {
  variation?: BannerActionVariation
  onClick?: () => void
  /**
   * className to be assigned to the button
   */
  className?: string
  /**
   * HTML tag or custom component being rendered
   */
  as?: React.ElementType
  /**
   * Updates component with children prop accordingly to the @types update
   */
  children?: ReactNode
}

const getVariationStyle = (bannerVariant: BannerVariant) => {
  switch (bannerVariant) {
    case 'lowEmphasis':
    case 'default':
      return css`
        color: ${theme.colors.secondary.main};
        border-color: ${theme.colors.secondary.main};
        &:hover {
          color: ${theme.colors.secondary.dark};
          border-color: ${theme.colors.secondary.dark};
        }
      `
    case 'mediumEmphasis':
      return css`
        color: ${theme.colors.text.primary.primary};
        border-color: ${theme.colors.text.primary.primary};
        &:hover {
          color: ${theme.colors.text.primary.primary};
        }
      `
    case 'highEmphasis':
    case 'inverted':
      return css`
        color: ${theme.colors.text.light.primary};
        border-color: ${theme.colors.text.light.primary};
        &:hover {
          color: ${theme.colors.text.light.primary};
        }
      `
  }
}

export const BannerAction: React.FunctionComponent<BannerActionProps> = ({ variation = 'primary', ...rest }) => {
  const { variant: bannerVariant } = useBannerContext()

  return (
    <Button
      variation={variation === 'primary-thick' ? 'outlined' : 'text'}
      type="button"
      css={css`
        ${(variation === 'primary' || variation === 'secondary') &&
        css`
          ${typography.action};
          padding: 0 ${theme.spacing.xs};
          border-width: ${variation === 'primary' ? '1px' : '0'};
          border-style: solid;
        `}
        flex: auto;
        flex-basis: auto;
        flex-grow: 0;
        margin-left: ${theme.spacing.xs};
        ${getVariationStyle(bannerVariant)}
      `}
      className="BannerAction"
      {...rest}
    />
  )
}
