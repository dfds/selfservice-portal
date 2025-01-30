/* eslint-disable deprecation/deprecation */
import React from 'react'
import { storiesOf } from '@storybook/react'
import Input from './Input'
import Lock from '@dfds-ui/icons/core/Lock'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'

const stories = storiesOf('Legacy/Input Fields/Base', module)

stories.add('Input(legacy)', () => {
  return (
    <StoryPage>
      {Md`
# Input
Input is a low level component for wrapping \`<input type="text">\` and \`<textarea>\` elements
`}
      <ExampleContainer headline="Basic usage">
        <Input name="input" placeholder="Hint text" />
        {Md`
~~~jsx
import { Input } from '@/components/dfds-ui/react-components';

<Input name="input" placeholder="Hint text" />
~~~

#### Ref example (Typescript)
This is fix when using hook version of ref
~~~jsx
import { Input } from '@/components/dfds-ui/react-components';
const ref = useRef();

<Input name="input" ref={ref as any} placeholder="Hint text" />
~~~
`}
      </ExampleContainer>
      {Md`
## Indicating errors
Setting the \`error\` prop to \`true\` will render the input with red border indicating an error
`}
      <ExampleContainer headline="Example showing error">
        <Input name="input" placeholder="Hint text" error />
        {Md`
~~~jsx
import { Input } from '@/components/dfds-ui/react-components';

<Input name="input" placeholder="Hint text" error />
~~~
`}
      </ExampleContainer>
      {Md`
## Icon
Using the \`icon\` prop it's possible to render an icon or an abbreviation inside the input
`}
      <ExampleContainer headline="Example showing abbreviation">
        <Input name="input" placeholder="Hint text" icon="Kg" />
        {Md`
~~~jsx
import { Input } from '@/components/dfds-ui/react-components';

<Input name="input" placeholder="Hint text" icon="Kg" />
~~~
`}
      </ExampleContainer>
      <ExampleContainer headline="Example showing icon">
        <Input name="input" placeholder="Hint text" icon={<Lock />} />
        {Md`
~~~jsx
import { Input } from '@/components/dfds-ui/react-components';
import { Lock } from '@dfds-ui/icons';

<Input name="input" placeholder="Hint text" icon={<Lock />} />
~~~
`}
      </ExampleContainer>
      {Md`
## Size
Using the \`size\` to display a smaller version
`}
      <ExampleContainer headline="Example showing abbreviation">
        <Input name="input" placeholder="Hint text" size="small" icon="Kg" />
        {Md`
~~~jsx
import { Input } from '@/components/dfds-ui/react-components';

<Input name="input" placeholder="Hint text"  size="small" icon="Kg" />
~~~
`}
      </ExampleContainer>

      {Md`
## Multiline (textarea)
Setting the \`multiline\` prop to \`true\` will render the input using a \`<textarea>\`
`}
      <ExampleContainer headline="Example showing multiline">
        <Input name="input" placeholder="Hint text" multiline />
        {Md`
~~~jsx
import { Input } from '@/components/dfds-ui/react-components';

<Input name="input" placeholder="Hint text" multiline />
~~~
`}
      </ExampleContainer>
      <ExampleContainer headline="Example showing disabled input">
        <Input name="input" placeholder="Disabled input" disabled />
        {Md`
~~~jsx
import { Input } from '@/components/dfds-ui/react-components';

<Input name="input" placeholder="Disabled input" disabled />
~~~
`}
      </ExampleContainer>
    </StoryPage>
  )
})
