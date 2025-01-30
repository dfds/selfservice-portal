/* eslint-disable deprecation/deprecation */
import React from 'react'
import { storiesOf } from '@storybook/react'
import TelField from './TelField'
import Lock from '@dfds-ui/icons/core/Lock'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'

const stories = storiesOf('Legacy/TelField', module)

stories.add('TelField', () => (
  <StoryPage>
    {Md`
# TelField
\`TelField\` is a high level composite component for text input
`}
    <ExampleContainer headline="Basic usage">
      <TelField name="name1" label="Label" />
      {Md`
~~~jsx
import { TelField } from '@/components/dfds-ui/react-components';

<TelField name="name1" label="Label" />
~~~
`}
    </ExampleContainer>
    {Md`
## Displaying Hint (placeholder), assistive text, Small version
Use the \`hintText\` and \`assistiveText\` props to set the placeholder text and assistive information for the input
    `}
    <ExampleContainer>
      <TelField name="name2" label="Label" hintText="Hint" assistiveText="Assistive text" />
      {Md`
~~~jsx
import { TelField } from '@/components/dfds-ui/react-components';

<TelField name="name2" label="Label" hintText="Hint" assistiveText="Assistive text" />
~~~
`}
    </ExampleContainer>
    <ExampleContainer>
      <TelField name="name3" label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
      {Md`
~~~jsx
import { TelField } from '@/components/dfds-ui/react-components';

<TelField name="name3" label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
    </ExampleContainer>
    <ExampleContainer>
      <TelField label="Label" hintText="Hint" size="small" assistiveText="Assistive text" icon={<Lock />} />
      {Md`
~~~jsx
import { TelField } from '@/components/dfds-ui/react-components';

<TelField label="Label" hintText="Hint" size="small" assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
    </ExampleContainer>
    {Md`
## Displaying errors
Use the \`errorMessage\` props to set the error for the input
    `}
    <ExampleContainer>
      <TelField name="name5" label="Label" hintText="Hint" errorMessage="Error text" icon={<Lock />} />
      {Md`
~~~jsx
import { TelField } from '@/components/dfds-ui/react-components';

<TelField name="name5" label="Label" hintText="Hint" errorMessage="Error text" icon={<Lock />} />
~~~
`}
    </ExampleContainer>
  </StoryPage>
))
