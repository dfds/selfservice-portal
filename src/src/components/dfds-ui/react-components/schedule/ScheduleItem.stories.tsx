import React from 'react'
import { storiesOf } from '@storybook/react'
import { Md } from '@dfds-ui/storybook-design'
import { ScheduleItem } from '.'

const stories = storiesOf('UI/Schedule', module)

stories.add('ScheduleItem', () => {
  return (
    <>
      <ScheduleItem time={'12.30'} text={'Super-fun activity'} backgroundColor={'#f5f6f7'} />
      {Md`
 ~~~jsx
 import { ScheduleItem } from '@/components/dfds-ui/react-components';

 const stringOfTime = '12.30'
 const stringOfText = 'Super-fun activity onboard the ship'
 const backgroundColor = '#f5f6f7'

 <ScheduleItem time={stringOfTime} text={stringOfText} backgroundColor={backgroundColor} />
 ~~~
`}
    </>
  )
})
