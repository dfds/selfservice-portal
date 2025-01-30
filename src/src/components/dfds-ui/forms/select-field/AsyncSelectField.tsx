import React from 'react'
import { GroupBase } from 'react-select'
import AsyncSelect, { AsyncProps } from 'react-select/async'
import styled from '@emotion/styled'

import AssistiveText from '../assistive-text/AssistiveText'
import ErrorText from '../error-text/ErrorText'
import HelpIcon from '../help-icon/HelpIcon'
import { Label } from '../label/Label'
import { FlexBox } from '@/components/dfds-ui/react-components/flexbox'
import { css } from '@emotion/react'

import { BaseFieldProps } from '../types'
import { media, theme } from '@/components/dfds-ui/theme'

type Size = 'small' | 'medium' | 'large'

const ReactSelectWrapper = styled.div<{
  error?: boolean
  size?: string
  arrow?: boolean
  selected?: boolean
  disabled?: boolean
}>`
  position: relative;

  [class$='-container'] {
    &:has(span#aria-selection) {
      [class$='-control'] {
        border: 1px solid ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.main)};
        box-shadow: inset 0 0 0 1px ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.main)};
      }
      [class$='-indicatorContainer'] {
        color: ${(p) => (p.error ? theme.colors.status.alert : theme.colors.secondary.dark)};
      }
    }

    [class$='-control'] {
      border: 1px solid ${theme.colors.text.dark.secondary};
      height: ${(p) =>
        (p.size === 'small' && '32px') || (p.size === 'medium' && '40px') || (p.size === 'large' && '48px')};
      min-height: ${(p) =>
        (p.size === 'small' && '32px') || (p.size === 'medium' && '40px') || (p.size === 'large' && '48px')};
      border-color: ${(p) =>
        p.error
          ? theme.colors.status.alert
          : p.disabled
          ? theme.colors.text.dark.disabled
          : theme.colors.text.dark.secondary};
      box-shadow: inset 0 0 0 ${(p) => (p.error ? 1 : 0)}px ${theme.colors.status.alert};
      padding-left: 5px;
      border-radius: 0;
      font-family: ${theme.fontFamilies.system};
      font-size: ${(p) => (p.size === 'large' && '1.125rem') || '1rem'};
      appearance: none;
      cursor: pointer;
      background-color: ${theme.colors.surface.primary};

      ${media.lessThanEqual('m')`
      font-size: 16px;
    `}

      &:hover {
        border: 1px solid ${theme.colors.text.dark.primary};
      }
    }
  }

  [class$='-indicatorContainer'] {
    color: ${theme.colors.text.dark.secondary};
  }

  [class$='-indicatorSeparator'] {
    display: none;
  }

  [class$='-placeholder'] {
    opacity: ${(p) => (p.disabled ? 0.3 : 1)};
  }

  [class$='-menu'] {
    margin-top: 0;
    margin-bottom: 0;
    z-index: 500000;
  }

  [class$='-option'] {
    font-family: ${theme.fontFamilies.system};
  }
`

export type AsyncSelectFieldProps<Option, IsMulti extends boolean, Group extends GroupBase<Option>> = BaseFieldProps &
  AsyncProps<Option, IsMulti, Group> & {
    isClearable?: boolean
    value?: any
    visualSize?: Size
  }

const AsyncSelectFieldInner = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
  {
    assistiveText,
    components,
    disabled,
    errorMessage,
    help,
    helpPlacement = 'top',
    hideAsterisk,
    isClearable = false,
    label,
    name,
    onBlur,
    onChange,
    required,
    visualSize = 'medium',
    ...rest
  }: AsyncSelectFieldProps<Option, IsMulti, Group>,
  ref: React.ForwardedRef<any>
) => {
  return (
    <FlexBox directionColumn>
      <FlexBox itemsFlexStart>
        {label && (
          <Label
            css={css`
              flex: 1;
              margin-bottom: 0.25rem;
            `}
            disabled={disabled}
            hideAsterisk={hideAsterisk}
            required={required}
            visualSize={visualSize === 'small' ? 'small' : 'medium'}
          >
            {label}
          </Label>
        )}

        {help && helpPlacement === 'top' ? <HelpIcon content={help} /> : undefined}
      </FlexBox>
      <ReactSelectWrapper
        error={(errorMessage && errorMessage.length > 0) || undefined}
        size={visualSize}
        disabled={disabled}
        arrow={true}
      >
        <AsyncSelect
          isClearable={isClearable}
          isDisabled={disabled}
          {...rest}
          ref={ref}
          onChange={(newValue, actionMeta) => {
            onChange && onChange(newValue, actionMeta)
          }}
          onBlur={(e) => onBlur && onBlur(e)}
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
            <AssistiveText disabled={disabled} id={name + '_aria'}>
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
export const AsyncSelectField = React.forwardRef(AsyncSelectFieldInner) as <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: AsyncSelectFieldProps<Option, IsMulti, Group> & {
    ref?: React.ForwardedRef<any>
  }
) => ReturnType<typeof AsyncSelectFieldInner>

export default AsyncSelectField
