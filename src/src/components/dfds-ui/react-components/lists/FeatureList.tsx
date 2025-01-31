import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import FlexBox, { FlexBoxProps } from './../flexbox/FlexBox'

type FeatureListProps = {
  icon: any
  items: string[]
  iconColor?: string
  textTag?: React.ElementType
  as?: React.ElementType
}

type FeatureListComponent = FunctionComponent<FeatureListProps>

export const ListItem = styled(FlexBox)<FlexBoxProps & { iconColor?: string }>`
  align-items: flex-start;
  svg {
    margin-right: 20px;
    ${({ iconColor }) => iconColor && `color: ${iconColor}`}
  }
  p {
    margin: 0 0 1em;
  }
`

const FeatureList: FeatureListComponent = ({ icon, items, iconColor, textTag = 'p', ...rest }) => {
  const list = items.map((item: string, i) => {
    const TextTag = textTag
    return (
      <ListItem key={i} iconColor={iconColor}>
        {icon}
        <TextTag>{item}</TextTag>
      </ListItem>
    )
  })
  return (
    <>
      <FlexBox {...rest} directionColumn>
        {list}
      </FlexBox>
    </>
  )
}

export default FeatureList
