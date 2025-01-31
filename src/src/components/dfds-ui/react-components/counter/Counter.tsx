import React, { useState, ReactNode, forwardRef } from 'react'
import styled from '@emotion/styled'
import { NumberDown, NumberUp } from '@/components/dfds-ui/icons/system'
import { css } from '@emotion/react'

export type CounterProps = {
  label?: ReactNode | string
  /**
   * Minimum value
   */
  minVal: number
  /**
   * Maximum value
   */
  maxVal: number
  disableMin?: boolean
  disableMax?: boolean

  /**
   *Name of the input element
   */
  name?: string
  currentVal?: number
  initialVal?: number
  /**
   *Callback when the value changes
   */
  executeOnChange?: (arg: number) => any
}

const StyledCounter = styled.div`
  align-items: center;
  display: inline-flex;
  padding: 15px 0;
  margin: 0;

  svg {
    fill: #68b2e3;
    color: #68b2e3;
  }
`

const StyledIconContainer = styled.div`
  width: 25px;
  height: 25px;
  cursor: pointer;
  user-select: none;
`

const LabelContainer = styled.div`
  margin-left: 20px;
  margin-right: 20px;
`

const StyledInput = styled.input`
  border: 1px solid #d8dad9;
  width: 40px;
  height: 40px;
  margin: 0 10px;
  text-align: center;
  /* stylelint-disable */
  appearance: textfield !important;
  /* stylelint-enable */

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }
`

const IconToggler = styled.div<{ disable?: boolean }>`
  ${(p) =>
    p.disable &&
    css`
      opacity: 0.3;
    `};
`

export const Counter = forwardRef<HTMLInputElement, CounterProps>((props, ref) => {
  const startValue = props.initialVal ?? props.minVal
  const [counterValue, setCounterValue] = useState(props.currentVal ?? startValue)
  return (
    <StyledCounter>
      <StyledIconContainer
        onClick={() => {
          if (!props.disableMin && counterValue - 1 >= props.minVal) {
            setCounterValue(counterValue - 1)
            if (props.executeOnChange) {
              props.executeOnChange(counterValue - 1)
            }
          }
        }}
      >
        <IconToggler disable={props.disableMin || counterValue === props.minVal}>
          <NumberDown width="100%" height="100%" />
        </IconToggler>
      </StyledIconContainer>
      {props.label ? (
        <LabelContainer>{props.label}</LabelContainer>
      ) : (
        <StyledInput
          ref={ref}
          tabIndex={0}
          type="number"
          name={props.name ?? 'counter'}
          value={counterValue}
          onChange={(e) => {
            if (parseInt(e.target.value, 10) <= props.maxVal && parseInt(e.target.value, 10) >= props.minVal) {
              setCounterValue(parseInt(e.target.value, 10))
              if (props.executeOnChange) {
                props.executeOnChange(parseInt(e.target.value, 10))
              }
            }
          }}
        />
      )}
      <StyledIconContainer
        onClick={() => {
          if (!props.disableMax && counterValue + 1 <= props.maxVal) {
            setCounterValue(counterValue + 1)
            if (props.executeOnChange) {
              props.executeOnChange(counterValue + 1)
            }
          }
        }}
      >
        <IconToggler disable={props.disableMax || counterValue === props.maxVal}>
          <NumberUp width="100%" height="100%" />
        </IconToggler>
      </StyledIconContainer>
    </StyledCounter>
  )
})

export default Counter
