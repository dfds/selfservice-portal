import React from 'react'
import { storiesOf } from '@storybook/react'
import Label from './Label'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'

const stories = storiesOf('Legacy/Base', module)

stories.add('Label', () => (
  <StoryPage>
    {Md`
# Label
Simple component for display text in a label
  `}

    <ExampleContainer headline="Basic example">
      <Label>Label text</Label>
      {Md`
~~~jsx
import { Label } from '@/components/dfds-ui/react-components';

<Label>Label text</Label>
~~~
`}
    </ExampleContainer>

    <ExampleContainer headline="Small example">
      <Label size="small">Label text</Label>
      {Md`
~~~jsx
import { Label } from '@/components/dfds-ui/react-components';

<Label size="small">Label text</Label>
~~~
`}
    </ExampleContainer>
    {Md`
## Required
The \`required\` prop accepts a \`boolean\` and will render an asterisk if set to \`true\`
`}
    <ExampleContainer headline="Example with required">
      <Label required>Label text</Label>
      {Md`
~~~jsx
import { Label } from '@/components/dfds-ui/react-components';

<Label required>Label text</Label>
~~~
`}
    </ExampleContainer>
  </StoryPage>
))
