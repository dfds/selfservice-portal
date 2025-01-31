import React from 'react'
import { storiesOf } from '@storybook/react'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'
import PluralCounter from './PluralCounter'

const stories = storiesOf('Legacy/Selection Controls/Counter', module)

stories.add('PluralCounter', () => {
  return (
    <StoryPage>
      {Md`
# Counter
`}
      <ExampleContainer headline="Basic usage">
        <PluralCounter minVal={0} maxVal={4} initialVal={0} singularLabel="room" pluralLabel="rooms" />
        <br />
        <PluralCounter minVal={0} maxVal={4} initialVal={1} singularLabel="room" pluralLabel="rooms" />
        <br />
        <PluralCounter minVal={0} maxVal={4} initialVal={2} singularLabel="room" pluralLabel="rooms" />
        {Md`
~~~jsx

import { PluralCounter } from '@/components/dfds-ui/react-components';

<PluralCounter minVal={0} maxVal={4} initialVal={0} singularLabel="room" pluralLabel="rooms" />
~~~
`}
      </ExampleContainer>
    </StoryPage>
  )
})
