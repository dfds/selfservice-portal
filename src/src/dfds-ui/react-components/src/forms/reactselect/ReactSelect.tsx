/* eslint-disable deprecation/deprecation */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import { Down, Close } from '@/dfds-ui/icons/src'
import { Drawer } from '../../drawer'
import Select, { components } from 'react-select'
export type BaseReactSelectProps = Omit<React.PropsWithRef<Select>, 'size' | 'css'>

export type Size = 'small' | 'medium'

export const ReactSelectWrapper = styled.div<{ error?: boolean; size?: string; arrow?: boolean; selected?: boolean }>`
  position: relative;

  &:focus-within {
    outline: none;
  }

  .react-select__control {
    border: 1px solid ${theme.colors.text.dark.secondary};
    height: ${(p) => (p.size === 'small' ? '40px' : '50px')};
    border-color: ${(p) => (p.error ? theme.colors.status.alert : theme.colors.text.dark.secondary)};
    box-shadow: inset 0 0 0 ${(p) => (p.error ? 1 : 0)}px ${theme.colors.status.alert};
    padding-left: 5px;
    border-radius: 0;
    font-size: 16px;
    appearance: none;
    cursor: pointer;
  }
  .react-select__menu {
    margin-top: 0;
    margin-bottom: 0;
  }
  .react-select__control--is-focused,
  .react-select__control--menu-is-open {
    border: 1px solid ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.main)};
    box-shadow: inset 0 0 0 1px ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.main)};
    outline: 0;

    &:hover {
      border-color: ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.main)};
    }
  }
  .react-select__option {
    color: ${theme.colors.primary.main};
    background-color: ${theme.colors.surface.primary};
    position: relative;
    ${(props) =>
      props.selected &&
      css`
        color: ${theme.colors.text.secondary.primary};
      `};
    ${(props) => theme.states.overlay(props.selected)};

    &--is-focused {
      &:after {
        opacity: 0.16;
      }
    }

    &--is-disabled {
      opacity: 0.3;
    }

    &--is-selected {
      &:after {
        opacity: 0.12;
      }
    }
  }

  .react-select__menu > div::before,
  .react-select__menu > div > ::before {
    ${(p) => !p.arrow && `display: none`};
  }

  .react-select__indicator-separator {
    display: none;
  }

  .react-select__menu-list {
    padding: 0;
  }
  .react-select--is-disabled {
    .react-select__control {
      pointer-events: none;

      border: 1px solid ${theme.colors.text.dark.disabled};
      background: ${theme.colors.surface.primary};
    }
    .react-select__placeholder {
      color: ${theme.colors.text.dark.disabled};
    }
  }
`

export const Icon = styled.span<{ size?: Size; disabled?: boolean }>`
  ${(p) =>
    p.disabled &&
    css`
      color: ${theme.colors.text.dark.disabled};
    `};
`

export const Menu = (props: any) => {
  return (
    <components.Menu {...props}>
      <Drawer
        verticalPosition={props.placement}
        css={css`
          bottom: auto;
          left: auto;
          position: relative;
          right: auto;
          top: auto;
        `}
      >
        {props.children}
      </Drawer>
    </components.Menu>
  )
}

export const ClearIndicator = (props: any) => {
  const {
    children = <Close />,
    getStyles,
    innerProps: { ref, ...restInnerProps },
  } = props

  return (
    <div {...restInnerProps} ref={ref} style={getStyles('clearIndicator', props)}>
      <div style={{ padding: `0 ${theme.spacing.xxs}px` }}>{children}</div>
    </div>
  )
}

// low level component for select element
const ReactSelect = (
  {
    name,
    error,
    selectClassName,
    className,
    icon,
    disabled,
    size = 'medium',
    arrow = true,
    htmlSize,
    isClearable = false,
    components,
    menuPlacement = 'auto',
    ...rest
  }: any,
  ref: any
) => {
  const DropdownIndicator = (props: any) => {
    const {
      children = (
        <Icon size={size} disabled={disabled}>
          {icon || <Down />}
        </Icon>
      ),
      getStyles,
      innerProps: { ref, ...restInnerProps },
    } = props

    return (
      <div {...restInnerProps} ref={ref} style={getStyles('dropdownIndicator', props)}>
        <div style={{ padding: `0 ${theme.spacing.xxs}` }}>{children}</div>
      </div>
    )
  }

  return (
    <ReactSelectWrapper error={error} size={size} className={className} arrow={arrow}>
      <Select
        as="Select"
        name={name}
        menuPlacement={menuPlacement}
        styles={{
          option: (provided) => {
            return {
              ...provided,
              ':active': {
                backgroundColor: 'transparent',
              },
            }
          },
        }}
        aria-invalid={error}
        visualSize={size}
        size={htmlSize}
        isDisabled={disabled}
        isClearable={isClearable}
        classNamePrefix="react-select"
        className={selectClassName}
        components={{ Menu, ...components, ClearIndicator, DropdownIndicator }}
        {...rest}
        ref={ref}
      />
    </ReactSelectWrapper>
  )
}
/** @deprecated Use dfds-ui/forms */
export default React.forwardRef(ReactSelect)
