import { FlexBox } from '@dfds-ui/react-components/flexbox'
import { Switch } from './Switch'
import React from 'react'

export const SwitchStates = () => {
  return (
    <>
      <div>
        <FlexBox justifySpaceAround>
          <Switch checked={false} name="off-resting">
            Off
          </Switch>
          <Switch checked name="on-resting">
            On
          </Switch>
        </FlexBox>
        <FlexBox justifySpaceAround>
          <Switch disabled checked={false} name="off-disabled">
            Off
          </Switch>
          <Switch disabled checked name="on-disabled">
            On
          </Switch>
        </FlexBox>
        <FlexBox justifySpaceAround>
          <Switch error checked={false} name="off-errored">
            Off
          </Switch>
          <Switch error checked name="on-errored">
            On
          </Switch>
        </FlexBox>
      </div>
    </>
  )
}

export const SwitchSizes = () => {
  return (
    <>
      <div>
        <Switch name="small-switch" size="small">
          Small
        </Switch>
      </div>
      <div>
        <Switch name="medium-switch" size="medium">
          Medium
        </Switch>
      </div>
    </>
  )
}
