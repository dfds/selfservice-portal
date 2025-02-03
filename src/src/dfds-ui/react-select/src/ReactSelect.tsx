import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { media, theme } from '@/dfds-ui/theme/src'
import { Drawer } from '@/dfds-ui/react-components/src'
import Select, { components, createFilter, GroupBase, OptionsOrGroups, SingleValue } from 'react-select'
import { ChevronDown } from '@/dfds-ui/icons/src/system'
import { Label } from '@/dfds-ui/forms/src'
import AssistiveText from '@/dfds-ui/forms/src/assistive-text/AssistiveText'
import ErrorText from '@/dfds-ui/forms/src/error-text/ErrorText'
import { BaseFieldProps } from '@/dfds-ui/forms/src/types'
import { FlexBox } from '@/dfds-ui/react-components/src/flexbox'

export type BaseReactSelectProps = Omit<React.PropsWithRef<Select>, 'size' | 'css'>

export type Size = 'small' | 'medium' | 'large'

export const ReactSelectWrapper = styled.div<{ error?: boolean; size?: string; arrow?: boolean; selected?: boolean }>`
  position: relative;
  margin-top: ${theme.spacing.xxs};
  margin-bottom: ${theme.spacing.xxs};

  &:focus-within {
    outline: none;
  }

  svg {
    color: ${theme.colors.text.dark.secondary};
  }

  .react-select__control {
    border: 1px solid ${theme.colors.text.dark.secondary};
    height: ${(p) =>
      (p.size === 'small' && '32px') || (p.size === 'medium' && '40px') || (p.size === 'large' && '48px')};
    min-height: ${(p) =>
      (p.size === 'small' && '32px') || (p.size === 'medium' && '40px') || (p.size === 'large' && '48px')};
    border-color: ${(p) => (p.error ? theme.colors.status.alert : theme.colors.text.dark.secondary)};
    box-shadow: inset 0 0 0 ${(p) => (p.error ? 1 : 0)}px ${theme.colors.status.alert};
    padding-left: 5px;
    border-radius: 0;
    font-size: 14px;
    appearance: none;
    cursor: pointer;

    ${media.lessThanEqual('m')`
      font-size: 16px;
    `}
  }
  .react-select__menu {
    margin-top: 0;
    margin-bottom: 0;
    z-index: 500000;
  }
  .react-select__control--is-focused,
  .react-select__control--menu-is-open {
    border: 1px solid ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.main)};
    box-shadow: inset 0 0 0 1px ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.main)};
    outline: 0;

    &:hover {
      border-color: ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.light)};
    }

    svg {
      color: ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.dark)};
    }
  }
  .react-select__option {
    color: ${theme.colors.primary.main};
    background-color: white;
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
        background-color: ${theme.colors.secondary.light};
      }
    }

    &--is-disabled {
      opacity: 0.3;
    }

    &--is-selected {
      &:after {
        opacity: 0.12;
        background-color: ${theme.colors.secondary.dark};
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

export const Menu = (props: any) => {
  return (
    <components.Menu {...props}>
      <Drawer
        showArrow={false}
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

export type SelectFieldProps<T> = BaseFieldProps & {
  defaultValue?: SingleValue<T>
  className?: string
  components?: any
  value?: SingleValue<T>
  visualSize?: Size
  options?: OptionsOrGroups<T, GroupBase<T>>
  isSearchable?: boolean
  onSelect?: (value: SingleValue<T>) => void
  onChange?: (value: SingleValue<T>) => void
  onBlur?: (value: any) => void
  menuIsOpen?: boolean
  placeholder?: string
  assistiveText?: string
  errorMessage?: string
  /**
   * Configuration object passed to react-select createFilter function to create [custom filter
   * logic](https://react-select.com/advanced#custom-filter-logic)
   * @param ignoreCase - boolean (optional)
   * @param ignoreAccents - boolean (optional)
   * @param stringify (obj: any) => string (optional)
   * @param trim - boolean (optional)
   * @param matchForm - 'any' | 'start'
   */
  filterConfig?: Parameters<typeof createFilter>[0]
}

function ReactSelectInner<T>(
  {
    name,
    label,
    defaultValue,
    value,
    placeholder,
    onSelect,
    onChange,
    isSearchable,
    onBlur,
    assistiveText,
    options,
    errorMessage,
    disabled,
    visualSize = 'medium',
    filterConfig,
    ...rest
  }: SelectFieldProps<T>,
  ref: React.ForwardedRef<any>
) {
  const DropdownIndicator = (props: any) => {
    const {
      children = <ChevronDown css={{ width: '24px', height: '24px' }} />,
      innerProps: { ref, ...restInnerProps },
    } = props

    return (
      <div {...restInnerProps} ref={ref}>
        <div style={{ padding: `0 ${theme.spacing.xxs}` }}>{children}</div>
      </div>
    )
  }

  return (
    <FlexBox
      directionColumn
      css={css`
        margin-bottom: ${!assistiveText && !errorMessage ? '1.5rem' : '0.5rem'};
      `}
    >
      {label && (
        <Label
          css={css`
            display: flex;
            align-items: center;
          `}
          visualSize={visualSize === 'small' ? 'small' : 'medium'}
          disabled={disabled}
        >
          <span
            css={css`
              flex: 1;
            `}
          >
            {label}
          </span>
        </Label>
      )}
      <ReactSelectWrapper error={(errorMessage && errorMessage.length > 0) || undefined} size={visualSize} arrow={true}>
        <Select
          value={value}
          defaultValue={defaultValue}
          name={name}
          isSearchable={isSearchable}
          menuPlacement={'auto'}
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
          options={options}
          onChange={(e) => {
            onChange && onChange(e)
            onSelect && onSelect(e)
          }}
          onBlur={(e) => onBlur && onBlur(e)}
          aria-invalid={(errorMessage && errorMessage.length > 0) || false}
          placeholder={placeholder}
          isDisabled={disabled}
          isClearable={false}
          classNamePrefix="react-select"
          className={'select-field'}
          components={{ ...components, DropdownIndicator }}
          filterOption={filterConfig && createFilter(filterConfig)}
          {...rest}
          ref={ref}
        />
      </ReactSelectWrapper>
      {assistiveText && !errorMessage && <AssistiveText id={name + '_aria'}>{assistiveText}</AssistiveText>}
      {errorMessage && <ErrorText id={name + '_aria'}>{errorMessage}</ErrorText>}
    </FlexBox>
  )
}
/** @deprecated Use dfds-ui/forms */
export const ReactSelect = React.forwardRef(ReactSelectInner)

/** @deprecated Use dfds-ui/forms */
export default ReactSelect
