/* eslint-disable deprecation/deprecation */
import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import TextField from './TextField'
import Lock from '@/dfds-ui/react-components/src/core/Lock'
import { css } from '@emotion/react'
import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import { Button } from '../../button'

const stories = storiesOf('Legacy/Input Fields/TextField', module)

const TextFieldStory = () => {
  const [error, setError] = useState(false)
  const [error2, setError2] = useState(false)

  const [value1, setValue1] = React.useState('')

  return (
    <StoryPage>
      {Md`
# TextField
\`TextField\` is a high level composite component for text input
`}
      <ExampleContainer headline="Basic usage">
        <TextField name="name" label="Label" value={value1} onChange={(event: any) => setValue1(event.target.value)} />
        {Md`
~~~jsx
import { TextField } from '@/dfds-ui/react-components/src';

const [myValue, setMyValue] = React.useState('');

<TextField name="my-name" label="my-Label" value={myValue} onChange={event => setMyValue(event.target.value)} />
~~~

#### Ref example (Typescript)
This is fix when using hook version of ref
~~~jsx
import { TextField } from '@/dfds-ui/react-components/src';

const [myValue, setMyValue] = React.useState('');
const ref = React.useRef()

<TextField name="my-name" ref={ref as any} label="my-Label" value={myValue} onChange={event => setMyValue(event.target.value)} />
~~~
`}
      </ExampleContainer>
      {Md`
## Displaying Hint (placeholder), Icons, Small version, assistive text and inverted version
Use the \`hintText\`, \`Icon\`, \`assistiveText\` and \`inverted\` props to set the placeholder text and assistive information for the input
    `}
      <ExampleContainer>
        <TextField name="name2" label="Label" hintText="Hint" assistiveText="Assistive text" />
        {Md`
~~~jsx
import { TextField } from '@/dfds-ui/react-components/src';

<TextField name="name2" label="Label" hintText="Hint" assistiveText="Assistive text" />
~~~
`}
      </ExampleContainer>
      <ExampleContainer>
        <TextField name="name3" label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
        {Md`
~~~jsx
import { TextField } from '@/dfds-ui/react-components/src';

<TextField name="name3" label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
      </ExampleContainer>
      <ExampleContainer>
        <TextField label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
        {Md`
~~~jsx
import { TextField } from '@/dfds-ui/react-components/src';

<TextField label="Label" hintText="Hint" assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
      </ExampleContainer>
      <ExampleContainer>
        <TextField label="Label" hintText="Hint" size="small" assistiveText="Assistive text" icon={<Lock />} />
        {Md`
~~~jsx
import { TextField } from '@/dfds-ui/react-components/src';

<TextField label="Label" hintText="Hint" size="small" assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
      </ExampleContainer>
      <ExampleContainer>
        <div
          css={css`
            background-color: #002b45;
            padding: 10px;
          `}
        >
          <TextField label="Label" hintText="Hint" inverted assistiveText="Assistive text" icon={<Lock />} />
        </div>
        {Md`
~~~jsx
import { TextField } from '@/dfds-ui/react-components/src';

<TextField label="Label" hintText="Hint" inverted assistiveText="Assistive text" icon={<Lock />} />
~~~
`}
      </ExampleContainer>

      {Md`
## Displaying Error Messages
Use the \`errorMessage\` to set an error.
    `}
      <ExampleContainer>
        <TextField
          label="Label"
          hintText="Hint"
          errorMessage={error ? 'Error message' : ''}
          assistiveText="Assistive text"
          icon={<Lock />}
        />
        <br />
        <Button
          onClick={() => {
            setError(!error)
          }}
        >
          Toggle error
        </Button>

        <TextField
          label="Label"
          hintText="Hint"
          errorMessage={error2 ? 'Error message' : ''}
          assistiveText="Assistive text"
          icon={<Lock />}
        />
        <TextField label="Label" hintText="Hint" errorMessage={error2 ? 'Error message' : ''} icon={<Lock />} />
        <TextField label="Label" hintText="Hint" errorMessage={error2 ? 'Error message' : ''} icon={<Lock />} />
        <br />
        <Button
          onClick={() => {
            setError2(!error2)
          }}
        >
          Toggle error
        </Button>
        {Md`
~~~jsx
import { TextField } from '@/dfds-ui/react-components/src';

<TextField label="Label" hintText="Hint"  errorMessage="Error message" icon={<Lock />} />
~~~
`}
      </ExampleContainer>

      {Md`
## Set value
Use the \`defaultValue\` to set initial value.
    `}
      <ExampleContainer>
        <div>
          <TextField label="Label" defaultValue="Dfds" icon={<Lock />} />
        </div>
        {Md`
~~~jsx
import { TextField } from '@/dfds-ui/react-components/src';

<TextField label="Label" value="Dfds" icon={<Lock />} />
~~~
`}
      </ExampleContainer>
    </StoryPage>
  )
}

stories.add('TextField', () => {
  return (
    <>
      <TextFieldStory />
    </>
  )
})
