import React, { useState, forwardRef, ForwardRefRenderFunction } from 'react'
import Counter from './Counter'
import styled from '@emotion/styled'

type PluralCounterProps = {
  minVal: number
  maxVal: number
  currentVal?: number
  initialVal?: number
  singularLabel: string
  name?: string
  pluralLabel: string
  executeOnChange?: (arg: number) => any
}

//Insert plural with max value as hidden to ensure rows are aligned. Assumes plural is longer than singular.
const WidthFix = styled.div`
  visibility: hidden;
  height: 0;
`

const PluralCounter: ForwardRefRenderFunction<HTMLInputElement, PluralCounterProps> = (
  { singularLabel, pluralLabel, executeOnChange, ...rest }: PluralCounterProps,
  ref
) => {
  const Label = (p: { val: number }) => (
    <div>
      {p.val} {p.val === 1 ? singularLabel : pluralLabel}
      <WidthFix>
        {rest.maxVal} {pluralLabel}
      </WidthFix>
    </div>
  )

  const [currentLabel, setCurrentLabel] = useState(<Label val={rest.currentVal ?? rest.initialVal ?? rest.minVal} />)
  const onChange = (s: number) => {
    setCurrentLabel(<Label val={s} />)
    if (executeOnChange) executeOnChange(s)
  }

  return <Counter executeOnChange={onChange} label={currentLabel} {...rest} ref={ref}></Counter>
}

export default forwardRef(PluralCounter)
