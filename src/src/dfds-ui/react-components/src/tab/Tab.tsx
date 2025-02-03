import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import { typography } from '@/dfds-ui/typography/src'
import useTabsContext from './TabsContext'

type Size = 's' | 'm'
export type Index = number | string

export type TabProps = {
  active?: boolean
  disabled?: boolean
  transparent?: boolean
  index: Index
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children?: React.ReactNode
}

const StyledTab = styled.button<{ size?: Size; active?: boolean; disabled?: boolean; transparent?: boolean }>`
  min-width: 6.5rem;
  max-width: 9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  outline: none;
  border: none;
  ${typography.action};
  line-height: 1.25rem;
  padding: 0 ${theme.spacing.xs};
  box-sizing: border-box;
  position: relative;
  color: ${theme.colors.text.primary.secondary};
  background: ${(p) => (p.transparent ? 'transparent' : theme.colors.surface.primary)};
  flex-shrink: 0;
  text-align: center;
  height: 3.25rem;
  cursor: pointer;

  &:first-of-type {
    border-radius: ${theme.radii.m} 0 0 0;
  }

  &:last-of-type {
    border-radius: 0 ${theme.radii.m} 0 0;
  }

  &:after {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    border-bottom: 1px solid ${theme.colors.text.primary.disabled};
  }

  &:hover {
    color: ${theme.colors.secondary.main};
  }

  &:active {
    color: ${theme.colors.secondary.dark};
  }

  &:focus {
    outline: ${theme.colors.secondary.main} solid ${theme.borders.widths.m};
    box-shadow: 0 0 4px ${theme.colors.secondary.main};
    z-index: 1;

    .js-focus-visible & :focus:not([data-focus-visible-added]) {
      outline: 0;
      box-shadow: none;
    }
  }

  ${(p) =>
    p.size === 's' &&
    css`
      height: 2.75rem;
      white-space: nowrap;
    `};

  ${(p) =>
    p.active &&
    css`
      color: ${theme.colors.secondary.main};

      &:after {
        border-bottom: ${theme.borders.widths.m} solid ${theme.colors.secondary.main};
      }

      &:hover {
        color: ${theme.colors.secondary.main};
      }

      &:active {
        color: ${theme.colors.secondary.dark};
      }
    `}

  ${(p) =>
    p.disabled &&
    css`
      color: ${theme.colors.text.primary.disabled};

      &:hover {
        color: ${theme.colors.text.primary.disabled};
        cursor: not-allowed;
      }

      &:after {
        border-bottom: ${theme.borders.widths.s} solid ${theme.colors.text.primary.disabled};
      }
    `}

  ${(p) =>
    p.disabled &&
    p.active &&
    css`
      color: ${theme.colors.text.secondary.secondary};

      &:after {
        border-bottom: ${theme.borders.widths.m} solid ${theme.colors.text.secondary.secondary};
      }
    `}
`

const Tab: React.FC<TabProps> = ({ children, index, onClick, ...rest }) => {
  const { transparent, activeTab, onChange, size } = useTabsContext()

  return (
    <StyledTab
      type="button"
      onClick={(event) => {
        !!onChange && onChange(index)
        !!onClick && onClick(event)
      }}
      active={index === activeTab}
      transparent={transparent}
      size={size}
      {...rest}
    >
      {children}
    </StyledTab>
  )
}

export default Tab
