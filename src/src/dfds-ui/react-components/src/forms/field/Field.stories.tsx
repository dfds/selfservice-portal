import React from 'react'
import { storiesOf } from '@storybook/react'
import Field from '../field/Field'
import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import styled from '@emotion/styled'

const stories = storiesOf('Legacy/Base', module)

const ArbitraryInputComponent = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  border: 1px solid #ccc;
  background-color: #eee;
  height: 50px;
  padding: 5px;
`

const CompositeInputComponent = () => {
  const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
  `
  return (
    <Wrapper>
      <ArbitraryInputComponent>Input 1</ArbitraryInputComponent>
      <ArbitraryInputComponent>Input 2</ArbitraryInputComponent>
      <ArbitraryInputComponent>Input 3</ArbitraryInputComponent>
    </Wrapper>
  )
}

stories.add('Field', () => {
  return (
    <StoryPage>
      {Md`
# Field
Field is a low level component for wrapping an arbitrary input component. It controls things like label and assistive text
`}
      <ExampleContainer>
        <Field label="Field label" assistiveText="Assistive text" required>
          <ArbitraryInputComponent>Arbitrary input component</ArbitraryInputComponent>
        </Field>
        {Md`
~~~jsx
import { Field } from '@/dfds-ui/react-components/src';

<Field label="Field label" assistiveText="Assistive text" required>
  <ArbitraryInputComponent>Input component</ArbitraryInputComponent>
</Field>
~~~
`}
      </ExampleContainer>

      <ExampleContainer>
        <Field label="Field label" assistiveText="Assistive text" required>
          <CompositeInputComponent />
        </Field>
        {Md`
~~~jsx
import { Field } from '@/dfds-ui/react-components/src';

<Field label="Field label" assistiveText="Assistive text" required>
  <ArbitraryInputComponent>Input component</ArbitraryInputComponent>
</Field>
~~~
`}
      </ExampleContainer>
    </StoryPage>
  )
})
