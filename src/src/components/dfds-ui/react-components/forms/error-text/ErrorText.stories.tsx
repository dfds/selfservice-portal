import React from 'react'
import { storiesOf } from '@storybook/react'
import ErrorText from '../error-text/ErrorText'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'

const stories = storiesOf('Legacy/Base', module)

stories.add('ErrorText', () => {
  return (
    <StoryPage>
      {Md`
# ErrorText
Very simple component to display assistive information. Used by \`Field\` to render error text.
`}
      <ExampleContainer>
        <ErrorText>Error text</ErrorText>
        {Md`
~~~jsx
import { ErrorText } from '@/components/dfds-ui/react-components';

<ErrorText>Error text</ErrorText>
~~~
`}
      </ExampleContainer>
      <ExampleContainer>
        <ErrorText small>Error text</ErrorText>
        {Md`
~~~jsx
import { ErrorText } from '@/components/dfds-ui/react-components';

<ErrorText small>Error text</ErrorText>
~~~
`}
      </ExampleContainer>
    </StoryPage>
  )
})
