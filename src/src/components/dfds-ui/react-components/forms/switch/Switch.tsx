import React from 'react'
import { css, SerializedStyles } from '@emotion/react'
import styled from '@emotion/styled'
import { YesTick } from '@/components/dfds-ui/icons'
import elevation from '../../elevation'
import { visuallyHidden } from '../../styles'
import { theme } from '@/components/dfds-ui/theme'
import { typography } from '@/components/dfds-ui/typography'

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

// eslint-disable-next-line deprecation/deprecation
const Checkmark = styled(YesTick)`
  color: ${theme.colors.secondary.main};
  transition: transform 250ms;
  opacity: 0;
  transform: scale(0);
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

    ${Checkmark} {
      width: 8px;
      height: 8px;
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

    ${Checkmark} {
      width: 10px;
      height: 10px;
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
  border-radius: 28px;
  transition: opacity 250ms;
  display: none;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  top: -2px;
  left: -2px;
  box-shadow: 0 0 0 2px ${theme.colors.secondary.main}, 0 0 4px 2px ${theme.colors.secondary.main};
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

  /** Hover */
  &:hover + ${Toggle} {
    background-color: ${theme.colors.secondary.dark};
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

type SwitchProps = React.PropsWithRef<JSX.IntrinsicElements['label']> & {
  name?: string
  checked?: boolean
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  right?: boolean
  size?: Size
  error?: boolean
}

const Switch: React.FunctionComponent<SwitchProps> = ({
  name,
  checked,
  onChange,
  disabled,
  children,
  right,
  error = false,
  size = 'medium',
  ...rest
}) => {
  return (
    <Label right={right} {...rest}>
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

export default Switch
