/* eslint-disable react/jsx-key */
import React from 'react'
import { storiesOf } from '@storybook/react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { StoryPage, Md } from '@/dfds-ui/storybook-design'
import theme from './theme'

const stories = storiesOf('Hydro Theme/States', module)

const buttonBase = css`
  position: relative;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 1rem 2rem 0;

  border-radius: ${theme.radii.m};
  border: 0;
`

const ExampleOverlayButton = styled.button<{ selected?: boolean }>`
  ${buttonBase};
  color: ${theme.colors.text.light.primary};
  background: ${theme.colors.secondary.main};
  ${(props) => theme.states.overlay(props.selected)};
`

const ExampleSelectableItem = ({ children }: { children: any }) => {
  const [selected, setSelected] = React.useState(false)

  return (
    <ExampleItem selected={selected} onClick={() => setSelected(!selected)}>
      {children}
    </ExampleItem>
  )
}

const ExampleItem = styled.button<{ selected?: boolean }>`
  ${buttonBase};
  color: ${theme.colors.text.dark.primary};
  background: transparent;

  ${(props) =>
    props.selected &&
    css`
      color: ${theme.colors.text.secondary.primary};
    `};
  ${(props) => theme.states.overlay(props.selected)};
`

const OverlayOverrideExample = styled.button<{ selected?: boolean }>`
  ${buttonBase};
  color: ${theme.colors.text.dark.primary};
  background: transparent;
  ${(props) =>
    theme.states.overlay(props.selected, {
      hover: '0.5',
    })};
`

const ExampleOutlineButton = styled.button<{ error?: boolean }>`
  ${buttonBase};
  color: ${theme.colors.text.light.primary};
  background: ${theme.colors.secondary.light};
  ${(props) => theme.states.outline(props.error)};
`

stories.add('States', () => {
  return (
    <StoryPage>
      {Md`
# States

States are visual representations used to communicate the status of a component or interactive element.
There are two types of states available - outline and overlay - and they can be accessed through the theme -
\`theme.states.outline\` and \`theme.states.overlay\` respectively.

~~~jsx
import { theme } from '@/dfds-ui/theme/src'

//overlay
theme.states.overlay

//outline
theme.states.outline
~~~

## Usage
Both are functions that return set of css rules defined using \`css\` from emotion. The states are meant to be applied
using emotion's composition pattern as follows:

__a) It is imperative that \`position\` rule is applied to the element that state is applied to.__

__b) \`overlay\` state uses :after pseudo element and \`outline\` state uses :before pseudo element, so that psuedo element
can be used when a given state is applied to the element.__

## Overlay

### Basic

Overlay state uses the \`currentColor\` to add a shade over an element as the user interacts with it.

~~~jsx

const ExampleOverlayButton = styled.button<{selected?: boolean}>\`
    position: relative;

    \${props => theme.states.overlay(props.selected)};
\`

<ExampleOverlayButton>Example button</ExampleOverlayButton>
~~~`}
      <ExampleOverlayButton>Overlay Button</ExampleOverlayButton>
      {Md`

### Change \`currentColor\` value

currentColor property can change in the lifetime of the component and the overlay state will inherit it

~~~jsx
const ExampleItem = styled.button<{ selected?: boolean }>\`
  color: \${theme.colors.text.dark.primary};
      background: transparent;

  \${props =>
        props.selected &&
        css\`
      color: \${theme.colors.text.secondary.primary};
    \`};
  \${props => theme.states.overlay(props.selected)};
    \`
~~~

`}

      <ExampleSelectableItem>Selectable Item</ExampleSelectableItem>
      {Md`

### Override opacity values

To cater for special cases, where different overlay state opacities are required for the background, it is possible to pass
a custom states \`states\` to the \`overlay\` function as follows:

~~~jsx

const OverlayOverrideExample = styled.button\`
  color: \${theme.colors.text.dark.primary};
  background: transparent;

  \${props =>
        theme.states.overlay(false, {
          hover: '0.5',
        })};
  \`
~~~`}

      <OverlayOverrideExample>State override</OverlayOverrideExample>

      {Md`

## Outline

Outline state applies an inset border around the element as the user interacts with it.

~~~jsx
const ExampleOutlineButton = styled.button<{selected?: boolean}>\`
    position: relative;

    \${props => theme.states.outline(props.selected)};
\`

<ExampleOutlineButton>Example button</ExampleOutlineButton>
~~~
`}

      <ExampleOutlineButton>Outline Button</ExampleOutlineButton>
    </StoryPage>
  )
})
