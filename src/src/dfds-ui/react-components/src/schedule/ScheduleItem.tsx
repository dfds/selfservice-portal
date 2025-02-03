import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import FlexBox from './../flexbox/FlexBox'

export type ListItemProps = {
  time: string
  text: string
  backgroundColor?: string
}

export const ListItemBase = styled(FlexBox)<{ backgroundColor?: string }>`
  box-sizing: border-box;
  outline: none;
  padding: 0 20px;
  height: 50px;
  display: flex;
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor || '#ffffff'};

  b {
    margin: 0 20px 0 0;
  }
`

type ScheduleItemComponent = FunctionComponent<ListItemProps>

const ScheduleItem: ScheduleItemComponent = ({ time, text, backgroundColor }) => {
  return (
    <ListItemBase backgroundColor={backgroundColor}>
      <b>{time}</b>
      <p>{text}</p>
    </ListItemBase>
  )
}

export default ScheduleItem
