import React from 'react'
import styled from '@emotion/styled'
import {
  primaryButtonStyles,
  secondaryButtonStyles,
  outlinedButtonStyles,
  textButtonStyles,
  dangerButtonStyles,
  linkButtonStyles,
} from './button-style'
import { BaseButton, BaseButtonProps, ButtonVariation, ButtonVariationProps } from './BaseButton'
import { CenteredSpinner } from '../spinner/Spinner'
import { theme } from '@/dfds-ui/theme/src'
import { typography } from '@/dfds-ui/typography/src'
import { css } from '@emotion/react'

type ButtonSize = 'medium' | 'small'
type IconAlign = 'left' | 'right'

export type ButtonProps = BaseButtonProps &
  ButtonVariationProps & {
    className?: string
    replace?: boolean
    submitting?: boolean
    fillWidth?: boolean
    size?: ButtonSize
    icon?: React.ReactNode
    iconAlign?: IconAlign
    iconSpacing?: string
    iconColor?: string
    as?: React.ElementType
    children?: React.ReactNode
  }

const Base = styled(BaseButton)<{ fillWidth?: boolean; size: ButtonSize; iconAlign?: 'left' | 'right' }>`
  ${typography.actionBold};
  max-width: 100%;
  min-width: 4rem;
  width: ${(p) => (p.fillWidth ? '100%' : undefined)};
  white-space: nowrap;
  transition: background-color 120ms ease, color 120ms ease;
  padding: 0 ${(p) => (p.iconAlign === 'right' ? '0.75rem' : '1rem')} 0
    ${(p) => (p.iconAlign === 'left' ? '0.75rem' : '1rem')};
  cursor: pointer;
  display: inline-flex;

  ${(p) =>
    p.size === 'small' &&
    css`
      padding: 0 0.5rem;
      height: 2rem;
      ${typography.action};
      font-weight: 400;
    `};

  &[aria-busy='true'] {
    opacity: 1;

    &:after {
      opacity: 0.08;
      visibility: visible;
    }
  }

  :not(&[aria-busy='true']) {
    &[disabled] {
      background: ${theme.colors.text.dark.disabled};
      color: ${theme.colors.text.light.primary};
    }
  }
`

const TextSpan = styled.span<{ submitting?: boolean }>`
  opacity: ${(p) => p.submitting && 0};
  flex-grow: 1;
  order: 1;
`

const IconSpan = styled.span<{
  submitting?: boolean
  iconAlign: 'left' | 'right'
  iconColor: string
  iconSpacing?: string | undefined
}>`
  display: flex;
  opacity: ${(p) => p.submitting && 0};
  margin-left: ${(p) => p.iconAlign !== 'left' && (p.iconSpacing ? p.iconSpacing : theme.spacing.xs)};
  margin-right: ${(p) => p.iconAlign === 'left' && (p.iconSpacing ? p.iconSpacing : theme.spacing.xs)};
  position: relative;
  order: ${(p) => (p.iconAlign === 'left' ? 0 : 1)};
  color: ${(p) => p.iconColor};
  ${typography.subHeadline};
`

const PrimaryButton = styled(Base)`
  ${primaryButtonStyles}
`

const SecondaryButton = styled(Base)`
  ${secondaryButtonStyles}
`

const OutlinedButton = styled(Base)`
  ${outlinedButtonStyles}
`

const TextButton = styled(Base)`
  ${textButtonStyles}
`

const DangerButton = styled(Base)`
  ${dangerButtonStyles}
`

const LinkButton = styled(Base)`
  ${textButtonStyles}
  ${linkButtonStyles}
`

function getButton(type: ButtonVariation) {
  switch (type) {
    default:
    case 'primary':
      return PrimaryButton
    case 'secondary':
      return SecondaryButton
    case 'outlined':
      return OutlinedButton
    case 'text':
      return TextButton
    case 'danger':
      return DangerButton
    case 'link':
      return LinkButton
  }
}

const Button: React.FC<ButtonProps> = ({
  variation,
  children,
  submitting,
  size = 'medium',
  icon,
  iconSpacing,
  iconAlign = 'right',
  iconColor = 'inherit',
  title,
  disabled = false,
  ...rest
}) => {
  const ButtonVariation = getButton(variation === undefined ? 'primary' : variation)
  const displayTitle = title || (typeof children === 'string' && children) || ''

  const spinnerSize = size === 'medium' ? '1.5rem' : '1.25rem'

  return (
    <ButtonVariation
      size={size}
      disabled={submitting || disabled}
      iconAlign={(icon && iconAlign) || undefined}
      {...rest}
      aria-busy={submitting}
      title={displayTitle}
    >
      <TextSpan submitting={submitting}>{children}</TextSpan>
      {icon && (
        <IconSpan submitting={submitting} iconAlign={iconAlign} iconColor={iconColor} iconSpacing={iconSpacing}>
          {icon}
        </IconSpan>
      )}
      {submitting ? (
        <CenteredSpinner
          size={spinnerSize}
          instant
          css={css`
            color: inherit;
          `}
        />
      ) : null}
    </ButtonVariation>
  )
}

Button.defaultProps = {
  variation: 'primary',
}

export default Button
