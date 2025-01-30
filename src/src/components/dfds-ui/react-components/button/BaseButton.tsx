import * as React from 'react'
import { baseButtonStyle, primaryButtonStyles, secondaryButtonStyles, outlinedButtonStyles } from './button-style'
import styled from '@emotion/styled'
import { theme } from '@dfds-ui/theme'

export const variations = ['primary', 'secondary', 'outlined', 'text', 'danger', 'link'] as const

export type BaseButtonProps = React.PropsWithoutRef<JSX.IntrinsicElements['button']>

export type ButtonVariation = typeof variations[number]
export type ButtonVariationProps = { variation?: ButtonVariation }

export const BaseButton = styled.button<{ selected?: boolean }>`
  ${baseButtonStyle};
  ${(props) => theme.states.overlay(props.selected)};
`

export function getButtonVariationStyle(variation?: ButtonVariation) {
  switch (variation) {
    default:
    case 'primary':
      return primaryButtonStyles
    case 'secondary':
      return secondaryButtonStyles
    case 'outlined':
      return outlinedButtonStyles
  }
}
