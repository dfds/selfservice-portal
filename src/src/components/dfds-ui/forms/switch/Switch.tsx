import React, { forwardRef, ChangeEvent } from 'react'
import { css, SerializedStyles } from '@emotion/react'
import styled from '@emotion/styled'
import { Yes } from '@dfds-ui/icons/system'
import elevation from '@dfds-ui/react-components/elevation'
import { visuallyHidden } from '@dfds-ui/react-components/styles'
import { theme } from '@/components/dfds-ui/theme'
import { typography } from '@/components/dfds-ui/typography'
import useSwitchContext from './SwitchContext'

type Size = 'small' | 'medium'

const ToggleKnot = styled.div`
  transition: 250ms;
  background-color: ${theme.colors.surface.primary};
  display: flex;
  align-items: center;
  border-radius: 50%;
  justify-content: center;
  user-select: none;
  ${elevation(3)}
`

const Checkmark = styled(Yes)`
  color: ${theme.colors.secondary.main};
  transition: transform 250ms;
  opacity: 0;
  transform: scale(0);
  width: 90%;
  height: auto;
`

// By specifying the type of toggleSizes we ensure that all (and only) keys which are part of the Size union type are defined
// [P in Size]: SerializedStyles
const toggleSizes: Record<Size, SerializedStyles> = {
  small: css`
    width: 32px;
    height: 20px;
    border-radius: 10px;

    ${ToggleKnot} {
      width: 16px;
      height: 16px;
    }
  `,
  medium: css`
    width: 40px;
    height: 24px;
    border-radius: 12px;

    ${ToggleKnot} {
      width: 20px;
      height: 20px;
    }
  `,
}

const knotTranslateDistances: Record<Size, SerializedStyles> = {
  small: css`
    transform: translateX(12px);
  `,
  medium: css`
    transform: translateX(16px);
  `,
}

const Toggle = styled.div<{ switchSize: Size }>`
  cursor: pointer;
  background-color: ${theme.colors.text.dark.secondary};
  display: block;
  position: relative;
  transition: background-color 250ms;
  font-size: 0;
  user-select: none;
  padding: 2px;
  ${({ switchSize }) => toggleSizes[switchSize]}
`

const ToggleOuterRing = styled.div`
  position: absolute;
  display: none;
  border-radius: 28px;
  transition: opacity 250ms;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  top: -1px;
  left: -1px;
  box-shadow: 0 0 0 2px ${theme.colors.secondary.main};
  filter: drop-shadow(0px 0px 4px ${theme.colors.secondary.main});
  user-select: none;
`

const HiddenInput = styled.input<{ switchSize: Size; error: boolean }>`
  ${visuallyHidden()}

  /** On */
  &:checked {
    + ${Toggle} {
      background-color: ${theme.colors.secondary.main};
    }

    + ${Toggle} ${ToggleKnot} {
      ${({ switchSize }) => knotTranslateDistances[switchSize]};
    }

    + ${Toggle} ${Checkmark} {
      opacity: 1;
      transform: scale(1);
    }
  }

  &:hover + ${Toggle} ${Checkmark} {
    color: ${theme.colors.secondary.dark};
  }

  /** Focus */
  &:focus + ${Toggle} ${ToggleOuterRing} {
    display: block;
  }

  .js-focus-visible & :focus:not([data-focus-visible-added]) {
    display: none;
  }

  /** Disabled */
  &[disabled] + ${Toggle} {
    background-color: ${theme.colors.text.dark.disabled};

    &:hover {
      cursor: not-allowed;
    }
    ${ToggleKnot} {
      box-shadow: none;
    }

    ${Checkmark} {
      color: ${theme.colors.text.dark.disabled};
    }
  }

  &:active:not([disabled]) + ${Toggle} {
    background-color: ${theme.colors.secondary.main};
  }

  /** Error */
  ${(p) =>
    p.error &&
    css`
      &:hover + ${Toggle} {
        background-color: ${theme.colors.status.alert};
      }
      &:hover + ${Toggle} ${Checkmark} {
        color: ${theme.colors.status.alert};
      }
      + ${Toggle} {
        background-color: ${theme.colors.status.alert};
      }

      + ${Toggle} ${Checkmark} {
        color: ${theme.colors.status.alert};
      }

      &:checked + ${Toggle} {
        background-color: ${theme.colors.status.alert};
      }

      &:checked + ${Toggle} ${Checkmark} {
        color: ${theme.colors.status.alert};
      }
    `}
`

const Content = styled.span<Partial<SwitchProps>>`
  ${typography.body};
  user-select: none;
  ${(p) =>
    p.right &&
    css`
      margin-right: ${theme.spacing.xs};
    `};
  ${(p) =>
    !p.right &&
    css`
      margin-left: ${theme.spacing.xs};
    `};
  ${(p) =>
    p.disabled &&
    css`
      color: ${theme.colors.text.dark.disabled};
    `};
`

const Label = styled.label<Partial<SwitchProps>>`
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  ${(p) =>
    p.right &&
    css`
      justify-content: flex-end;
    `};
`

export type SwitchProps = React.PropsWithRef<JSX.IntrinsicElements['label']> & {
  /**
   * Name of the input element
   */
  name?: string
  /**
   * State of the switch
   *
   */
  checked?: boolean
  /**
   * Controls whether the input is disabled
   */
  disabled?: boolean
  /**
   * Callback to fire when the state of the input changes
   */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * Controls whether the input label should be displayed on the right of the input, displayed on the left by default
   */
  right?: boolean
  /**
   * Visual size of the switch
   */
  size?: Size
  error?: boolean
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      name,
      checked,
      onChange,
      disabled,
      children,
      right,
      error: errorProp = false,
      size: sizeProp = 'medium',
      ...rest
    }: SwitchProps,
    ref
  ) => {
    const groupCtx = useSwitchContext()
    const size = groupCtx !== undefined ? groupCtx.size : sizeProp
    const error = groupCtx !== undefined ? groupCtx.error : errorProp

    return (
      <Label right={right} size={size} disabled={disabled} {...rest}>
        {children && right && (
          <Content right={right} disabled={disabled}>
            {children}
          </Content>
        )}

        <HiddenInput
          type="checkbox"
          name={name}
          disabled={disabled}
          checked={checked}
          onChange={onChange}
          readOnly={!onChange}
          switchSize={size}
          error={error}
          ref={ref}
        />

        <Toggle switchSize={size}>
          <ToggleKnot>
            <Checkmark />
          </ToggleKnot>
          <ToggleOuterRing />
        </Toggle>

        {children && !right && (
          <Content size={size} disabled={disabled}>
            {children}
          </Content>
        )}
      </Label>
    )
  }
)
