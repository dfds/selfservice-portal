import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { media, theme } from '@/components/dfds-ui/theme'
import CreatableSelect, { CreatableProps } from 'react-select/creatable'
import {
  ActionMeta,
  components as reactSelectComponents,
  createFilter,
  GroupBase,
  MultiValue,
  OptionsOrGroups,
  SingleValue,
} from 'react-select'
import { ChevronDown } from '@/components/dfds-ui/icons/system'
import { Label } from '../label/Label'
import AssistiveText from '../assistive-text/AssistiveText'
import ErrorText from '../error-text/ErrorText'
import { BaseFieldProps } from '../types'
import { FlexBox } from '@/components/dfds-ui/react-components/flexbox'
import HelpIcon from '../help-icon/HelpIcon'
import { InputAddon } from '@/components/dfds-ui/react-components/forms/input/InputComposition'

type Size = 'small' | 'medium' | 'large'

const ReactSelectWrapper = styled.div<{ error?: boolean; size?: string; arrow?: boolean; selected?: boolean }>`
  position: relative;

  &:focus-within {
    outline: none;
  }

  svg {
    color: ${theme.colors.text.dark.secondary};
  }

  .react-select__control {
    border: 1px solid ${theme.colors.text.dark.secondary};
    min-height: ${(p) =>
      (p.size === 'small' && '32px') || (p.size === 'medium' && '40px') || (p.size === 'large' && '48px')};
    border-color: ${(p) => (p.error ? theme.colors.status.alert : theme.colors.text.dark.secondary)};
    box-shadow: inset 0 0 0 ${(p) => (p.error ? 1 : 0)}px ${theme.colors.status.alert};
    padding-left: 5px;
    border-radius: 0;
    font-family: ${theme.fontFamilies.system};
    font-size: ${(p) => (p.size === 'large' && '1.125rem') || '1rem'};
    appearance: none;
    cursor: pointer;

    ${media.lessThanEqual('m')`
      font-size: 16px;
    `}

    &:hover {
      border-color: ${(p) => (p.error ? theme.colors.status.alert : theme.colors.text.dark.primary)};
    }
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
    font-family: ${theme.fontFamilies.system};
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

      svg {
        color: ${theme.colors.text.dark.disabled};
      }
    }
    .react-select__placeholder {
      color: ${theme.colors.text.dark.disabled};
    }
  }
`

export type CreatableSelectFieldProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
> = BaseFieldProps &
  CreatableProps<Option, IsMulti, Group> & {
    assistiveText?: string
    autoFocus?: boolean
    className?: string
    components?: any
    defaultValue?: SingleValue<Option>
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
    /**
     * Indicates that the Select can be cleared after selecting an Option.
     *
     * Setting this to true will display a small dismiss cross when a value is selected
     */
    isClearable?: boolean
    isMulti?: boolean
    isSearchable?: boolean
    menuIsOpen?: boolean
    menuPlacement?: 'bottom' | 'auto' | 'top'
    onBlur?: (value: any) => void
    onChange?: (newValue: SingleValue<Option> | MultiValue<Option>, actionMeta: ActionMeta<Option>) => void
    onSelect?: (value: SingleValue<Option> | MultiValue<Option>) => void
    options?: OptionsOrGroups<Option, GroupBase<Option>>
    placeholder?: string
    prefix?: React.ReactNode
    styles?: any
    suffix?: React.ReactNode
    value?: SingleValue<Option> | MultiValue<Option>
    visualSize?: Size
  }

const CreatableSelectFieldInner = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
  {
    assistiveText,
    components,
    defaultValue,
    disabled,
    errorMessage,
    filterConfig,
    help,
    helpPlacement = 'top',
    hideAsterisk,
    isClearable = false,
    isMulti,
    isSearchable,
    label,
    name,
    onBlur,
    onChange,
    onSelect,
    options,
    placeholder,
    required,
    styles,
    value,
    visualSize = 'medium',
    ...rest
  }: CreatableSelectFieldProps<Option, IsMulti, Group>,
  ref: React.ForwardedRef<any>
) => {
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

  const ValueContainer = ({ ...props }: any) => {
    const prefix = props.selectProps?.prefix
    const suffix = props.selectProps?.suffix

    return (
      <>
        {prefix && (
          <InputAddon
            css={css`
              flex: 0;
              padding: 2px 8px;
              ${disabled &&
              css`
                color: ${theme.colors.text.primary.disabled};
              `};
            `}
          >
            {prefix}
          </InputAddon>
        )}

        <reactSelectComponents.ValueContainer {...props}>{props.children}</reactSelectComponents.ValueContainer>

        {suffix && (
          <InputAddon
            css={css`
              flex: 0;
              padding: 2px 8px;
              ${disabled &&
              css`
                color: ${theme.colors.text.primary.disabled};
              `};
            `}
          >
            {suffix}
          </InputAddon>
        )}
      </>
    )
  }

  return (
    <FlexBox directionColumn>
      <FlexBox itemsFlexStart>
        {label && (
          <Label
            css={css`
              flex: 1;
              margin-bottom: 0.25rem;
            `}
            visualSize={visualSize === 'small' ? 'small' : 'medium'}
            required={required}
            hideAsterisk={hideAsterisk}
            disabled={disabled}
          >
            {label}
          </Label>
        )}
        {help && helpPlacement === 'top' ? <HelpIcon content={help} disabled={disabled} /> : undefined}
      </FlexBox>
      <ReactSelectWrapper error={(errorMessage && errorMessage.length > 0) || undefined} size={visualSize} arrow={true}>
        <CreatableSelect
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
            ...styles,
          }}
          options={options}
          onChange={(newValue, actionMeta) => {
            onChange && onChange(newValue, actionMeta)
            onSelect && onSelect(newValue)
          }}
          onBlur={(e) => onBlur && onBlur(e)}
          aria-invalid={(errorMessage && errorMessage.length > 0) || false}
          placeholder={placeholder}
          isDisabled={disabled}
          isClearable={isClearable}
          isMulti={isMulti}
          classNamePrefix="react-select"
          className={'select-field'}
          components={{ DropdownIndicator, ValueContainer, ...components }}
          filterOption={filterConfig && createFilter(filterConfig)}
          {...rest}
          ref={ref}
        />
      </ReactSelectWrapper>
      {(assistiveText || errorMessage) && (
        <FlexBox
          css={css`
            margin-top: 0.25rem;
          `}
          {...(assistiveText || errorMessage ? { justifySpaceBetween: true } : { justifyFlexEnd: true })}
        >
          {assistiveText && !errorMessage && (
            <AssistiveText id={name + '_aria'} disabled={disabled}>
              {assistiveText}
            </AssistiveText>
          )}
          {errorMessage && <ErrorText id={name + '_aria'}>{errorMessage}</ErrorText>}
        </FlexBox>
      )}
    </FlexBox>
  )
}

// Typing Generic forwardRef look here:
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref/58473012
// https://fettblog.eu/typescript-react-generic-forward-refs/
export const CreatableSelectField = React.forwardRef(CreatableSelectFieldInner) as <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: CreatableSelectFieldProps<Option, IsMulti, Group> & {
    ref?: React.ForwardedRef<any>
  }
) => ReturnType<typeof CreatableSelectFieldInner>

export default CreatableSelectField
