/* eslint-disable deprecation/deprecation */
import React from 'react'
import { storiesOf } from '@storybook/react'
import { FeatureList } from '.'
import { Yes } from '@/components/dfds-ui/icons/system'
import notes from './FeatureList.md'

const stories = storiesOf('UI/FeatureList', module)

const items = [
  'This is feature 1',
  'This is feature 2',
  'This is feature 3',
  'This is feature 4 that is very long in text so it will split into multiple lines',
]

stories.add(
  'FeatureList',
  () => {
    return (
      <>
        <FeatureList icon={<Yes />} as="ul" items={items} iconColor={'#5087ac'} />
      </>
    )
  },
  { notes }
)
