import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

export const baseButtonStyle = css`
  display: flex;
  align-items: center;
  position: relative;
  height: 2.75rem;
  border: ${theme.borders.widths.m} solid transparent;
  border-radius: ${theme.radii.m};
  box-sizing: border-box;
  text-decoration: none;
  text-align: center;
  user-select: none;
  vertical-align: middle;
  font-weight: 700;
  overflow: visible;
  border: none;

  &:after {
    border-radius: ${theme.radii.m};
  }

  &[disabled] {
    cursor: not-allowed;
  }
`

export const primaryButtonStyles = css`
  color: ${theme.colors.text.light.primary};
  background: ${theme.colors.tertiary.main};

  :not([aria-busy='true']) {
    &[disabled] {
      color: ${theme.colors.text.light.primary};
      background: ${theme.colors.tertiary.main};
    }
  }
`

export const secondaryButtonStyles = css`
  color: ${theme.colors.text.light.primary};
  background: ${theme.colors.secondary.main};

  :not([aria-busy='true']) {
    &[disabled] {
      color: ${theme.colors.text.light.primary};
      background: ${theme.colors.secondary.main};
    }
  }
`

export const outlinedButtonStyles = css`
  color: ${theme.colors.secondary.main};
  background: transparent;
  border: ${theme.borders.widths.m} solid currentColor;

  &:hover {
    color: ${theme.colors.secondary.dark};
  }

  :not([aria-busy='true']) {
    &[disabled] {
      background: ${theme.colors.surface.primary};
      color: ${theme.colors.text.secondary.disabled};
      border-color: ${theme.colors.text.secondary.disabled};
    }
  }
`

export const textButtonStyles = css`
  color: ${theme.colors.secondary.main};
  background: transparent;

  &:hover,
  &:active {
    color: ${theme.colors.secondary.dark};
    cursor: pointer;
  }

  :not([aria-busy='true']) {
    &[disabled] {
      background: transparent;
      color: ${theme.colors.text.secondary.primary};
    }
  }
`

export const dangerButtonStyles = css`
  color: ${theme.colors.status.alert};
  background: transparent;

  &:hover {
    cursor: pointer;
  }

  :not([aria-busy='true']) {
    &[disabled] {
      background: transparent;
      color: ${theme.colors.status.alert};
    }
  }
`

export const linkButtonStyles = css`
  padding: 0;
  min-width: 0;

  &:after {
    background: transparent;
  }

  &[disabled] {
    cursor: not-allowed;
  }
`
