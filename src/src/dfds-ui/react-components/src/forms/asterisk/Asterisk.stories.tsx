import React from 'react'
import { storiesOf } from '@storybook/react'
import Asterisk from '../asterisk/Asterisk'
import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'

const stories = storiesOf('Legacy/Base', module)

stories.add('Asterisk', () => {
  return (
    <StoryPage>
      {Md`
# Asterisk
Very simple component to display an asterisk. Used by \`Label\` to indicate that a field is required.
`}
      <ExampleContainer>
        <Asterisk />
        {Md`
~~~jsx
import { Asterisk } from '@/dfds-ui/react-components/src';

<Asterisk />
~~~
`}
      </ExampleContainer>
    </StoryPage>
  )
})
