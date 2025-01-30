/* eslint-disable deprecation/deprecation */
import React from 'react'
import { storiesOf } from '@storybook/react'
import EmailField from './EmailField'
import Lock from '@dfds-ui/icons/core/Lock'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'

const stories = storiesOf('Legacy/EmailField', module)

stories.add('EmailField', () => (
  <StoryPage>
    {Md`
# EmailField
\`EmailField\` is a high level composite component for text input
`}
    <ExampleContainer headline="Basic usage">
      <EmailField name="name1" label="Label" />
      {Md`
~~~jsx
import { EmailField } from '@/components/dfds-ui/react-components';

<EmailField name="name1" label="Label" />
~~~
`}
    </ExampleContainer>
    {Md`
## Displaying Hint (placeholder), assistive text and Small version
Use the \`hintText\` and \`assistiveText\` props to set the placeholder text and assistive information for the input
    `}
    <ExampleContainer>
      <EmailField name="name2" label="Label" hintText="Hint" assistiveText="Assistive text" />
      {Md`
~~~jsx
import { EmailField } from '@/components/dfds-ui/react-components';

<EmailField name="name2" label="Label" hintText="Hint" assistiveText="Assistive text" />
~~~
`}
    </ExampleContainer>
    <ExampleContainer>
      <EmailField name="name3" label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
      {Md`
~~~jsx
import { EmailField } from '@/components/dfds-ui/react-components';

<EmailField name="name3" label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
    </ExampleContainer>
    <ExampleContainer>
      <EmailField label="Label" hintText="Hint" size="small" assistiveText="Assistive text" icon={<Lock />} />
      {Md`
~~~jsx
import { EmailField } from '@/components/dfds-ui/react-components';

<EmailField label="Label" hintText="Hint" size="small" assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
    </ExampleContainer>

    {Md`
## Displaying errors
Use the \`errorMessage\` props to set the error for the input
    `}
    <ExampleContainer>
      <EmailField name="name4" label="Label" hintText="Hint" errorMessage="Error text" icon={<Lock />} />
      {Md`
~~~jsx
import { EmailField } from '@/components/dfds-ui/react-components';

<EmailField name="name4" label="Label" hintText="Hint" errorMessage="Error text" icon={<Lock />} />
~~~
`}
    </ExampleContainer>
  </StoryPage>
))
