import React from 'react'
import { storiesOf } from '@storybook/react'
import AssistiveText from '../assistive-text/AssistiveText'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'

const stories = storiesOf('Legacy/Base', module)

stories.add('AssistiveText', () => {
  return (
    <StoryPage>
      {Md`
# AssistiveText
Very simple component to display assistive information. Used by \`Field\` to render related assistive text.
`}
      <ExampleContainer>
        <AssistiveText>Assistive text</AssistiveText>
        {Md`
~~~jsx
import { AssistiveText } from '@/components/dfds-ui/react-components';

<AssistiveText>Assistive text</AssistiveText>
~~~
`}
      </ExampleContainer>
    </StoryPage>
  )
})
