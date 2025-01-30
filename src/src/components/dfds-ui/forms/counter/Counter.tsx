import React, { useState, ReactNode, forwardRef, useRef, useEffect } from 'react'
import { IconButton } from '@/components/dfds-ui/react-components'
import { NumberDown, NumberUp } from '@dfds-ui/icons/system'
import { theme } from '@/components/dfds-ui/theme'
import { css } from '@emotion/react'

type Size = 's' | 'm'
export type CounterProps = {
  /**
   * Minimum value
   */
  minValue: number
  /**
   * Maximum value
   */
  maxValue: number
  /**
   * Disables the minus button
   */
  disableMin?: boolean
  /**
   * Disables the plus button
   */
  disableMax?: boolean
  /**
   * Class name
   */
  className?: string
  /**
   * Disables input of counter
   */
  disableInput?: boolean
  /**
   * Name of the input element
   */
  name?: string
  /**
   * Initial value of the counter, if not specified it's set to `minValue`
   */
  value?: number
  /**
   * Sets default value
   */
  defaultValue?: number
  /**
   * Set aria label on plus/increase
   */
  increaseAriaLabel?: string
  /**
   * Set aria label on minus/decrease
   */
  decreaseAriaLabel?: string
  /**
   * Disable tool tips
   */
  disableToolTips?: boolean
  /**
   * Callback when value changes
   */
  onChange?: (
    arg: number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.ChangeEvent<HTMLInputElement>
  ) => void
  /**
   * Label to display instead of the input element, see example below
   */
  text?: ReactNode
  /**
   * Size of counter
   */
  size?: Size
}

const counterContainerStyle = css`
  align-items: center;
  display: inline-flex;
  margin: 0;

  svg {
    fill: #68b2e3;
    color: #68b2e3;
  }
`

const labelContainerStyle = (size: Size) => css`
  margin: 0 ${size === 's' ? '0' : '4px'};
`

const inputStyle = (size: Size) => css`
  margin: 0 4px;
  ${size === 'm' ? 'width: 40px; height: 40px;' : 'width: 32px; height: 32px;'}
  border: 1px solid rgba(77, 78, 76, 0.7);
  border-radius: 2px;
  font-size: 16px;
  text-align: center;

  /* stylelint-disable */
  appearance: textfield !important;
  /* stylelint-enable */

  /* Disabling up/down selectors */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }

  &:focus,
  &:active {
    outline: 0;
    border: 2px solid ${theme.colors.secondary.dark};
  }

  &:not(:disabled):not(:focus):hover {
    border: 1px solid ${theme.colors.text.dark.primary};
  }

  &:disabled {
    border: 1px solid rgba(77, 78, 76, 0.3); /* text.dark.primary */
    cursor: not-allowed;
  }
`

const buttonDisabledStyle = css`
  padding: 0;
  opacity: 0.3;
  cursor: not-allowed;
  svg {
    fill: ${theme.colors.secondary.main};
    color: ${theme.colors.secondary.main};
  }
`

const buttonStyle = css`
  padding: 0;

  &:hover {
    svg {
      fill: ${theme.colors.secondary.dark};
      color: ${theme.colors.secondary.dark};
    }
  }
`

const isCounterDisabled = (disable: boolean, limit: number, value: number) => disable || value === limit
const getButtonStyle = ({
  size,
  hasText,
  disabled,
  disabledValue,
  value,
}: {
  size: Size
  hasText: boolean
  disabled: boolean
  disabledValue: number
  value: number
}) => {
  const styles = [isCounterDisabled(disabled, disabledValue, value) ? buttonDisabledStyle : buttonStyle]
  if (size === 'm') {
    return styles
  }
  return [
    ...styles,
    hasText
      ? css`
          min-height: 2rem;
          min-width: 2rem;
        `
      : css`
          min-height: 2rem;
        `,
  ]
}

const buttonWithoutFocusProps = {
  tabIndex: -1,
}

export const Counter = forwardRef<HTMLInputElement, CounterProps>(
  (
    {
      defaultValue,
      minValue,
      maxValue,
      disableMin,
      disableMax,
      disableInput,
      className,
      increaseAriaLabel,
      decreaseAriaLabel,
      name = 'counter',
      onChange,
      text,
      value,
      size = 'm',
      disableToolTips,
      ...rest
    }: CounterProps,
    ref
  ) => {
    const startValue = defaultValue ?? minValue
    const [counterValue, setCounterValue] = useState(value ?? startValue)
    const prevCountRef: React.MutableRefObject<number | undefined> = useRef()
    const minButtonCss = getButtonStyle({
      size,
      hasText: !!text,
      disabled: !!disableMin,
      disabledValue: minValue,
      value: counterValue,
    })
    const maxButtonCss = getButtonStyle({
      size,
      hasText: !!text,
      disabled: !!disableMax,
      disabledValue: maxValue,
      value: counterValue,
    })

    useEffect(() => {
      // Assign previous count to ref
      if (counterValue) prevCountRef.current = counterValue
    }, [counterValue]) //run this code when the value of count changes

    return (
      <div className={className} css={counterContainerStyle}>
        <IconButton
          disableTooltip={disableToolTips ?? false}
          css={minButtonCss}
          role="button"
          icon={NumberDown}
          ariaLabel={decreaseAriaLabel ?? 'Minus'}
          disableOverlay
          onClick={(e) => {
            if (isNaN(counterValue)) setCounterValue(0)
            else if (!disableMin && counterValue - 1 >= minValue) {
              setCounterValue(counterValue - 1)
              if (onChange) {
                onChange(counterValue - 1, e)
              }
            }
          }}
          {...(!!text && !isCounterDisabled(!!disableMin, minValue, counterValue) ? {} : buttonWithoutFocusProps)}
        />
        {text ? (
          <div css={labelContainerStyle(size)}>{text}</div>
        ) : (
          <input
            css={inputStyle(size)}
            disabled={disableInput}
            ref={ref}
            {...rest}
            tabIndex={0}
            type="number"
            name={name}
            value={counterValue}
            onBlur={() => {
              if (isNaN(counterValue) && prevCountRef.current) setCounterValue(prevCountRef.current)
            }}
            onChange={(e) => {
              if (
                e.target.value === '' ||
                (parseInt(e.target.value, 10) <= maxValue && parseInt(e.target.value, 10) >= minValue)
              ) {
                setCounterValue(parseInt(e.target.value, 10))
                if (onChange && e.target.value !== '') {
                  onChange(parseInt(e.target.value, 10), e)
                }
              }
            }}
          />
        )}
        <IconButton
          disableTooltip={disableToolTips ?? false}
          css={maxButtonCss}
          role="button"
          icon={NumberUp}
          ariaLabel={increaseAriaLabel ?? 'Plus'}
          disableOverlay
          onClick={(e) => {
            if (isNaN(counterValue)) setCounterValue(1)
            else if (!disableMax && counterValue + 1 <= maxValue) {
              setCounterValue(counterValue + 1)
              if (onChange) {
                onChange(counterValue + 1, e)
              }
            }
          }}
          {...(!!text && !isCounterDisabled(!!disableMax, maxValue, counterValue) ? {} : buttonWithoutFocusProps)}
        />
      </div>
    )
  }
)
