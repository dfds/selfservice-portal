import React from 'react'
import { storiesOf } from '@storybook/react'
import Counter from './Counter'
import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'

const stories = storiesOf('Legacy/Selection Controls/Counter', module)

stories.add('Counter', () => {
  return (
    <StoryPage>
      {Md`
# Counter
`}
      <ExampleContainer headline="Basic usage">
        <Counter minVal={0} maxVal={99} initialVal={10} />
        {Md`
~~~jsx
import { Counter } from '@/dfds-ui/react-components/src';

<Counter minVal={0} maxVal={99} initialVal={10} />
~~~
`}
      </ExampleContainer>
      <ExampleContainer headline="Basic usage">
        {Md`
## With custom selected value
`}
        <Counter currentVal={33} minVal={0} maxVal={99} />
        {Md`
~~~jsx
import { Counter } from '@/dfds-ui/react-components/src';

<Counter currentVal={33} minVal={0} maxVal={99} />
~~~
`}
      </ExampleContainer>
      <ExampleContainer headline="With label">
        {Md`
## With custom label
`}
        <Counter currentVal={33} minVal={0} maxVal={99} label="Custom label" />
        {Md`
~~~jsx
import { Counter } from '@/dfds-ui/react-components/src';

<Counter currentVal={33} minVal={0} maxVal={99} label="Custom label" />
~~~
`}
      </ExampleContainer>
    </StoryPage>
  )
})
