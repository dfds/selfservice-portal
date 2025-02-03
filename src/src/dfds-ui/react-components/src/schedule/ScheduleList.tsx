import React, { FunctionComponent } from 'react'
import FlexBox from '../flexbox/FlexBox'
import { ScheduleItem } from './'

type ScheduleListItem = {
  time: string
  text: string
}

type ScheduleListProps = {
  items: ScheduleListItem[]
}

type ScheduleListComponent = FunctionComponent<ScheduleListProps>

const ScheduleList: ScheduleListComponent = ({ items, ...rest }) => {
  const list = items.map((item: ScheduleListItem, i) => {
    return <ScheduleItem time={item.time} text={item.text} backgroundColor={i % 2 ? '#f5f6f7' : ''} key={i} />
  })
  return (
    <FlexBox directionColumn {...rest}>
      {list}
    </FlexBox>
  )
}

export default ScheduleList
