import { css } from '@emotion/react'
import React, { Fragment, useState } from 'react'
import { Checkbox } from './Checkbox'

export const Examples = () => {
  return (
    <Fragment>
      <Checkbox name="c1">Checkbox medium size</Checkbox>
      <Checkbox name="c2" error>
        Checkbox medium size with error
      </Checkbox>
      <Checkbox name="c3" disabled>
        Disabled Checkbox medium size
      </Checkbox>
      <Checkbox name="c4" visualSize="small">
        Checkbox small size
      </Checkbox>
      <Checkbox name="c5" visualSize="small" error>
        Checkbox small size with error
      </Checkbox>
      <Checkbox name="c6" visualSize="small" disabled>
        Disabled Checkbox small size
      </Checkbox>
    </Fragment>
  )
}

export const Help = () => {
  return (
    <Fragment>
      <Checkbox help="Some help text." name="c1">
        Checkbox medium size
      </Checkbox>
    </Fragment>
  )
}

export const InputVerticalAlignment = () => {
  return (
    <Fragment>
      <Checkbox name="c1">
        Here set to <code>center</code> (default). I acknowledge and understand that I am allowing DFDS to use my
        information for the purpose of responding to this form. Follow this link to see DFDS' Privacy Policy.
      </Checkbox>
      <hr />
      <Checkbox name="c2" inputVerticalAlignment="top">
        Here set to <code>top</code>. I acknowledge and understand that I am allowing DFDS to use my information for the
        purpose of responding to this form. Follow this link to see DFDS' Privacy Policy.
      </Checkbox>
    </Fragment>
  )
}

export const HandlingOnClickEvent = () => {
  const [active, setActive] = useState(false)

  return (
    <div
      css={css`
        padding: 16px;
        background-color: ${active ? '#adffad' : '#ffadad'};
      `}
      onClick={() => {
        setActive((active) => !active)
      }}
    >
      <div>
        <label>Red or green</label>
      </div>
      <Checkbox
        name="chk"
        onLabelClick={(e) => {
          e.stopPropagation()
        }}
      >
        Clicking this checkbox (or label) will not change the color of the container. Clicking outside will.
      </Checkbox>
    </div>
  )
}
