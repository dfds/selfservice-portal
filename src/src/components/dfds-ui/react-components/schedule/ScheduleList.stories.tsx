import React from 'react'
import { storiesOf } from '@storybook/react'
import { Md } from '@dfds-ui/storybook-design'
import { ScheduleList } from '.'

const stories = storiesOf('UI/Schedule', module)

const items = [
  {
    time: '12.30',
    text: 'Activity 1',
  },
  {
    time: '13.30',
    text: 'Activity 2',
  },
  {
    time: '14.30',
    text: 'Activity 3',
  },
  {
    time: '15.30',
    text: 'Activity 4',
  },
]

stories.add('ScheduleList', () => {
  return (
    <>
      <ScheduleList items={items} />
      {Md`
 ~~~jsx
 import { ScheduleList } from '@/components/dfds-ui/react-components';

 const arrayOfItems = [
  {
    time: '12.30',
    text: 'Activity 1',
  },
  {
    time: '13.30',
    text: 'Activity 2',
  },
  {
    time: '14.30',
    text: 'Activity 3',
  },
  {
    time: '15.30',
    text: 'Activity 4',
  },
]

 <ScheduleList items={arrayOfItems} />
 ~~~
`}
    </>
  )
})
