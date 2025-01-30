import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

export type Alignment = 'left' | 'right'

export type Size = 'small' | 'medium'

interface InputProps
  extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'size' | 'css'> {
  name: string
  multiline?: boolean
  required?: boolean
  error?: boolean
  className?: string
  wrapperClassName?: string
  icon?: React.ReactNode
  iconAlignment?: Alignment // TODO: is this used for anything ?
  placeholder?: string
  placeholderAlignment?: Alignment
  size?: Size
  htmlSize?: number
}

const Wrapper = styled.div`
  position: relative;
`

const textAreaStyles = css`
  min-height: calc(6em * 1.2 + 32px);
  line-height: 1.2;
  vertical-align: top;
`

const paddingRight = (px: number) => {
  return css`
    padding-right: ${px}px;
  `
}

type StyledInputProps = {
  hasIcon: boolean
  multiline?: boolean
  as: 'input' | 'textarea'
  placeholderAlignment?: Alignment
  visualSize?: Size
}

const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  border: 1px solid ${theme.colors.text.dark.secondary};
  background-color: ${theme.colors.surface.primary};
  line-height: 20px;
  font-size: 16px;

  ${(p) =>
    p.visualSize === 'small'
      ? css`
          height: 40px;
          padding: 9px 14px;
        `
      : css`
          height: 50px;
          padding: 14px;
        `};
  ${(p) => p.hasIcon && paddingRight(45)};
  ${(p) => p.multiline && textAreaStyles};

  &:focus {
    border: 2px solid ${theme.colors.secondary.main};
    outline: 0;
  }

  &[aria-invalid='true'] {
    border: 2px solid ${theme.colors.status.alert};
  }

  &:focus,
  &[aria-invalid='true'] {
    ${(p) =>
      p.visualSize === 'small'
        ? css`
            padding: 8px 13px;
          `
        : css`
            padding: 13px;
          `};
    ${(p) => p.hasIcon && paddingRight(45)};
  }

  &[disabled] {
    pointer-events: none;
    color: ${theme.colors.text.dark.disabled};
    border: 1px solid ${theme.colors.text.dark.disabled};
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
`

const Icon = styled.span<{ size?: Size; disabled?: boolean }>`
  position: absolute;
  top: 1px;
  right: 1px;
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 20px;
  width: 45px;
  pointer-events: none;

  ${(p) =>
    p.size === 'small'
      ? css`
          height: 38px;
        `
      : css`
          height: 48px;
        `};
  ${(p) =>
    p.disabled &&
    css`
      color: ${theme.colors.text.dark.disabled};
    `};
`

// low level component for input element
const Input: React.ForwardRefRenderFunction<HTMLInputElement, InputProps> = (props, ref) => {
  const {
    name,
    multiline,
    error,
    icon,
    placeholder,
    placeholderAlignment,
    wrapperClassName,
    size = 'medium',
    htmlSize,
    disabled,
    ...rest
  } = props
  return (
    <Wrapper className={wrapperClassName}>
      <StyledInput
        name={name}
        as={multiline ? 'textarea' : 'input'}
        multiline={multiline}
        aria-invalid={error}
        hasIcon={!!icon}
        placeholder={placeholder}
        placeholderAlignment={placeholderAlignment}
        visualSize={size}
        size={htmlSize}
        disabled={disabled}
        ref={ref}
        {...rest}
      />
      {icon && (
        <Icon size={size} disabled={disabled}>
          {icon}
        </Icon>
      )}
    </Wrapper>
  )
}

export default React.forwardRef(Input)
