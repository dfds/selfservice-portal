import React, { Fragment } from 'react'
import { Radio } from './Radio'

export const Examples = () => {
  return (
    <Fragment>
      <Radio name="r1" label="Radio medium size" />
      <Radio name="r2" label="Radio medium size with error" error />
      <Radio name="r3" label="Disabled radio medium size" disabled />
      <Radio name="r4" label="Radio small size" visualSize="small" />
      <Radio name="r5" label="Radio small size with error" visualSize="small" error />
      <Radio name="r6" label="Disabled radio small size" visualSize="small" disabled />
    </Fragment>
  )
}
