/* eslint-disable deprecation/deprecation */
import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'
import { Down } from '@dfds-ui/icons'

export type BaseSelectProps = Omit<JSX.IntrinsicElements['select'], 'size' | 'css'>

export type Size = 'small' | 'medium'

export type SelectProps = BaseSelectProps & {
  name: string
  required?: boolean
  error?: boolean
  className?: string
  icon?: React.ReactNode
  wrapperClassName?: string
  children?: React.ReactNode
  size?: Size
  htmlSize?: number
}

const Wrapper = styled.div`
  position: relative;
`
type StyledSelectProps = {
  as: 'select'
  visualSize?: Size
}

const StyledSelect = styled.select<StyledSelectProps>`
  width: 100%;
  overflow: visible;
  appearance: none;
  cursor: pointer;
  border: 1px solid ${theme.colors.text.dark.secondary};
  background-color: ${theme.colors.surface.primary};
  font-size: 16px;
  position: relative;

  ${(p) =>
    p.visualSize === 'small'
      ? css`
          height: 40px;
          padding: 0 16px;
        `
      : css`
          height: 50px;
          padding: 0 16px;
        `};

  &:focus {
    border: 1px solid ${theme.colors.secondary.main};
    box-shadow: 0 0 0 1px ${theme.colors.secondary.main}, 0 0 6px ${theme.colors.secondary.main};
  }

  .js-focus-visible & :focus:not([data-focus-visible-added]) {
    border: 1px solid ${theme.colors.text.dark.secondary};
    outline: none;
    padding: 0 16px;
  }

  &:focus {
    outline: 0;
  }

  &[aria-invalid='true'] {
    border-color: ${theme.colors.status.alert};
    box-shadow: inset 0 0 0 1px ${theme.colors.status.alert};
  }

  &[disabled] {
    pointer-events: none;
    color: ${theme.colors.text.dark.disabled};
    border-color: ${theme.colors.text.dark.disabled};
  }

  &::-ms-expand {
    display: none;
  }
`

const Icon = styled.span<{ size?: Size; disabled?: boolean }>`
  pointer-events: none;
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

// low level component for select element
const Select: React.ForwardRefRenderFunction<HTMLSelectElement, SelectProps> = (props, ref) => {
  const { name, error, wrapperClassName, icon, size = 'medium', htmlSize, disabled, ...rest } = props

  return (
    <Wrapper className={wrapperClassName}>
      <StyledSelect
        name={name}
        as={'select'}
        aria-invalid={error}
        visualSize={size}
        size={htmlSize}
        ref={ref}
        disabled={disabled}
        {...rest}
      />

      {icon ? (
        <Icon size={size} disabled={disabled}>
          {icon}
        </Icon>
      ) : (
        <Icon size={size} disabled={disabled}>
          <Down />
        </Icon>
      )}
      <div className="focus-visible-border" />
    </Wrapper>
  )
}

export default React.forwardRef(Select)
