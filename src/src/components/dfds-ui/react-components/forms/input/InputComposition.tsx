import React, { forwardRef, ReactNode } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

// Example
/*
<InputComposition>
  <InputAddon />
  <InputControl />
  <InputIcon />
</InputComposition>
*/

export type Alignment = 'left' | 'right'

export type Size = 'small' | 'medium' | 'large'

type ReactInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export type InputCompositionProps = {
  visualSize?: Size
  className?: string
  children?: ReactNode
} & React.PropsWithoutRef<JSX.IntrinsicElements['div']>

export type InputIconProps = {
  icon: React.ElementType
  color?: string
  className?: string
  size?: Size
}

export type InputProps = {
  /**
   * Name of the input element
   */
  name: string
  /**
   * Indicates that the input element has an error
   */
  error?: boolean
  className?: string
  placeholder?: string
  placeholderAlignment?: Alignment
  disabled?: boolean
  children?: React.ReactNode
} & Omit<ReactInputProps, 'css'>

const iconSizes = {
  small: '24px',
  medium: '24px',
}

// Warning: line-heights are specifically tweaked for alignment in iOS.
// Please test extensively before changing these styles!
export function inputTypography(size: Size) {
  switch (size) {
    case 'small':
      return css`
        font-size: 1rem;
        font-family: ${theme.fontFamilies.system};
        line-height: 1.25;
      `
    case 'medium':
      return css`
        font-size: 1rem;
        font-family: ${theme.fontFamilies.system};
        line-height: 1.25;
      `
    case 'large':
      return css`
        font-size: 1.125rem;
        font-family: ${theme.fontFamilies.system};
        line-height: 1.35;
      `
  }
}

// const textAreaStyles = css`
//   min-height: calc(6em * 1.2 + 32px);
//   line-height: 1.2;
//   vertical-align: top;
// `

// Warning: line-heights are specifically tweaked for alignment in iOS.
// Please test extensively before changing these styles!
function sizeStyles({ visualSize }: { visualSize: Size }) {
  switch (visualSize) {
    case 'small':
      return css`
        height: 2rem;
        font-size: 1rem;
        padding-right: 0.5rem;
        & ${InputElement} {
          ${inputTypography(visualSize)};
        }
        & ${InputAddon} {
          padding-left: 0.5rem;
        }
        & ${InputIcon} {
          padding-left: 0.25rem;
        }
      `
    case 'medium':
      return css`
        height: 2.5rem;
        font-size: 1rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        & ${InputElement} {
          ${inputTypography(visualSize)};
        }
        & ${InputAddon} {
          padding-left: 0.25rem;
        }
      `
    case 'large':
      return css`
        height: 3rem;
        font-size: 1.125rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        & ${InputElement} {
          ${inputTypography(visualSize)};
        }
        & ${InputAddon} {
          padding-left: 0.25rem;
        }
      `
  }
}

export const InputComposition = ({ visualSize = 'medium', children, ...rest }: InputCompositionProps) => {
  return (
    <div
      css={css`
        display: flex;
        position: relative;
        align-items: center;
        font-family: ${theme.fontFamilies.system};
        background-color: ${theme.colors.surface.primary};
        line-height: 1.25;
        ${sizeStyles({ visualSize })};
      `}
      {...rest}
    >
      {children}
    </div>
  )
}

const Icon = ({ className, icon: Icon, color, size = 'medium', ...rest }: InputIconProps) => {
  return (
    <span className={className}>
      <Icon {...rest} />
    </span>
  )
}

export const InputIcon = styled(Icon)`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${iconSizes.small};
  color: ${theme.colors.text.dark.secondary};
`

const Addon = ({ className, children, ...rest }: { className?: string; children?: ReactNode }) => {
  return (
    <span className={className} {...rest}>
      {children}
    </span>
  )
}

export const InputAddon = styled(Addon)`
  flex: 1 0 auto;
  color: ${theme.colors.text.primary.primary};
`

const InputBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  box-shadow: none;
  transition: box-shadow 50ms;
`

const InputElement = styled.input<InputProps>`
  align-self: stretch;
  width: 100%;
  border: 0;
  background-color: ${theme.colors.surface.primary};
  padding: 0 0 0 0.5rem;
  color: ${theme.colors.text.dark.primary};

  &:focus {
    outline: 0;
  }

  &[disabled] {
    pointer-events: none;
    color: ${theme.colors.text.dark.disabled};
    opacity: 1; /* Some browsers use natively */
  }

  /* Chrome, Firefox, Opera, Safari 10.1+ */
  ::placeholder {
    color: ${theme.colors.text.dark.disabled};
    opacity: 1; /* Firefox */
    text-align: ${({ placeholderAlignment }) => placeholderAlignment === 'right' && 'right'};
  }
  /* Internet Explorer 10-11 */
  :-ms-input-placeholder {
    color: ${theme.colors.text.dark.disabled};
  }
  /* Microsoft Edge */
  ::-ms-input-placeholder {
    color: ${theme.colors.text.dark.disabled};
  }

  /* style the border according the state */
  & ~ ${InputBorder} {
    border: 1px solid ${theme.colors.text.dark.secondary};
  }

  &[aria-invalid='true'] ~ ${InputBorder} {
    border: 2px solid ${theme.colors.status.alert};
  }

  &:hover ~ ${InputBorder} {
    border: 1px solid ${theme.colors.text.dark.primary};
  }

  /* prettier-ignore */
  &:focus ~ ${InputBorder},
  &[aria-haspopup='true'] ~ ${InputBorder},
  &[aria-expanded='true'] ~ ${InputBorder} {
    opacity: 1;
    border: 2px solid ${theme.colors.secondary.main};
    /* box-shadow: 0 0 4px 0 ${theme.colors.secondary.main}; */
  }

  &[disabled] ~ ${InputBorder} {
    border: 1px solid ${theme.colors.text.dark.disabled};
    cursor: pointer;
  }

  &[disabled] ~ ${InputIcon} {
    color: ${theme.colors.text.dark.disabled};
  }
`

export const InputControl = forwardRef<HTMLInputElement, InputProps>(
  ({ error, disabled, ...rest }: InputProps, ref) => {
    return (
      <>
        <InputElement aria-invalid={error} disabled={disabled} {...rest} ref={ref} />
        <InputBorder />
      </>
    )
  }
)
