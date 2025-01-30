/* eslint-disable deprecation/deprecation */
import React from 'react'
import { storiesOf } from '@storybook/react'
import NumberField from './NumberField'
import Lock from '@dfds-ui/icons/core/Lock'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'
import { Button } from '../../button'
import { css } from '@emotion/react'
const stories = storiesOf('Legacy/NumberField', module)

stories.add('NumberField', () => (
  <StoryPage>
    {Md`
# NumberField
\`NumberField\` is a high level composite component for text input
`}
    <ExampleContainer headline="Basic usage">
      <NumberField name="name1" label="Label" />
      {Md`
~~~jsx
import { NumberField } from '@/components/dfds-ui/react-components';

<NumberField name="name1" label="Label" />
~~~
`}
    </ExampleContainer>
    {Md`
## Displaying Hint (placeholder), assistive text and Small version
Use the \`hintText\` and \`assistiveText\` props to set the placeholder text and assistive information for the input
    `}
    <ExampleContainer>
      <NumberField name="name2" label="Label" hintText="Hint" assistiveText="Assistive text" />
      {Md`
~~~jsx
import { NumberField } from '@/components/dfds-ui/react-components';

<NumberField name="name2" label="Label" hintText="Hint" assistiveText="Assistive text" />
~~~
`}
    </ExampleContainer>
    <ExampleContainer>
      <NumberField name="name3" label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
      {Md`
~~~jsx
import { NumberField } from '@/components/dfds-ui/react-components';

<NumberField name="name3" label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
    </ExampleContainer>{' '}
    <ExampleContainer>
      <NumberField label="Label" hintText="Hint" size="small" assistiveText="Assistive text" icon={<Lock />} />
      {Md`
~~~jsx
import { NumberField } from '@/components/dfds-ui/react-components';

<NumberField label="Label" hintText="Hint" size="small" assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
    </ExampleContainer>
    {Md`
## Displaying errors
Use the \`errorMessage\` props to set the error for the input
    `}
    <ExampleContainer>
      <div
        css={css`
          display: flex;
          flex-direction: row;
        `}
      >
        <NumberField name="name4" label="Label" hintText="Hint" errorMessage="Error text" icon={<Lock />} />
        <Button>Test</Button>
      </div>
      {Md`
~~~jsx
import { NumberField } from '@/components/dfds-ui/react-components';

<NumberField name="name4" label="Label" hintText="Hint" errorMessage="Error text" icon={<Lock />} />
~~~
`}
    </ExampleContainer>
  </StoryPage>
))
