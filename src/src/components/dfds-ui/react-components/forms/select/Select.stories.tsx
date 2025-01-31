/* eslint-disable deprecation/deprecation */
import React from 'react'
import { storiesOf } from '@storybook/react'
import Select from '../select/Select'
import Lock from '@/components/dfds-ui/icons/core/Lock'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'

const stories = storiesOf('Legacy/Input Fields/SelectField', module)

stories.add('Select', () => {
  return (
    <StoryPage>
      {Md`
# Select
Select is a low level component for wrapping \`<select>\` elements
`}
      <ExampleContainer headline="Basic usage">
        <Select name="select">
          <option value="">Pick</option>
          <option>Value</option>
        </Select>
        {Md`
~~~jsx
import { Select } from '@/components/dfds-ui/react-components';

<Select name="select" value={this.state.value} onChange={this.handleChange}>
  <option value="">Pick</option>
  <option>Value</option>
</Select>
`}
      </ExampleContainer>
      {Md`
## Indicating errors
Setting the \`error\` prop to \`true\` will render the select with red border indicating an error
`}
      <ExampleContainer headline="Example showing error">
        <Select name="select" value="Value" error>
          <option value="">Pick</option>
          <option>Value</option>
        </Select>
        {Md`
~~~jsx
import { Select } from '@/components/dfds-ui/react-components';

<Select name="select"  error>
  <option value="">Pick</option>
  <option>Value</option>
</Select>
`}
      </ExampleContainer>
      {Md`
## Disabled
Using the \`disabled\` prop it's possible to disabled a select
`}

      <ExampleContainer headline="Example showing disabled select">
        <Select name="select" disabled>
          <option value="">Pick</option>
          <option>Value</option>
        </Select>
        {Md`
~~~jsx
import { Select } from '@/components/dfds-ui/react-components';

<Select name="select" disabled>
  <option value="">Pick</option>
  <option>Value</option>
</Select>
`}
      </ExampleContainer>
      {Md`
## Icon
Using the \`icon\` prop to change the select icon
`}

      <ExampleContainer headline="Example showing icon in select">
        <Select name="select" icon={<Lock />}>
          <option value="">Pick</option>
          <option>Value</option>
        </Select>
        {Md`
~~~jsx
import { Select } from '@/components/dfds-ui/react-components';

<Select name="select" icon={<Lock />}>
  <option value="">Pick</option>
  <option>Value</option>
</Select>
`}
      </ExampleContainer>

      {Md`
## Size
Using the \`size\` prop it's display a smaller version
`}

      <ExampleContainer headline="Example showing small select">
        <Select name="select" size="small">
          <option value="">Pick</option>
          <option>Value</option>
        </Select>
        {Md`
~~~jsx
import { Select } from '@/components/dfds-ui/react-components';

<Select name="select" site="small">
  <option value="">Pick</option>
  <option>Value</option>
</Select>
`}
      </ExampleContainer>
    </StoryPage>
  )
})
