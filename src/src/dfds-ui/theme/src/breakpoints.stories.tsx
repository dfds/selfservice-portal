import React from 'react'
import { storiesOf } from '@storybook/react'
import styled from '@emotion/styled'
import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import theme from './theme'
import media, { generateMedia, useBreakpoint } from './media'

const stories = storiesOf('Hydro Theme/Breakpoints', module)

const LessThanMediaDemo = styled.div`
  height: 50px;
  width: 50px;
  border: 2px dotted ${theme.colors.status.warning};

  ${media.lessThan('l')`
    background: ${theme.colors.secondary.main};
  `}
`

const GreaterThanMediaDemo = styled.div`
  height: 50px;
  width: 50px;
  border: 2px dotted ${theme.colors.status.warning};

  ${media.greaterThan('m')`
    background: ${theme.colors.secondary.main};
  `}
`

const BetweenMediaDemo = styled.div`
  height: 50px;
  width: 50px;
  border: 2px dotted ${theme.colors.status.warning};

  ${media.between('m', 'l')`
    background: ${theme.colors.secondary.main};
  `}
`

const customMedia = generateMedia({
  customBreakpoint: 555,
})

const CustomBreakpointDemo = styled.div`
  height: 50px;
  width: 50px;
  border: 2px dotted ${theme.colors.status.warning};

  ${customMedia.lessThan('customBreakpoint')`
    background: ${theme.colors.secondary.main};
  `}
`

const UseBreakpointDemo = () => {
  const { lessThan, greaterThan, between } = useBreakpoint()
  return (
    <div>
      {lessThan('m') && <div>Shown if less than (m)</div>}
      {greaterThan('m') && <div>Shown if greater than {theme.breakpoints['m']} (m)</div>}

      {between('m', 'l') && (
        <div>
          Shown if between {theme.breakpoints['m']} (m) and {theme.breakpoints['l']} (m)
        </div>
      )}
    </div>
  )
}

const UseBreakpointWithCustomDemo = () => {
  const customBreakpoints = {
    small: 500,
    ok: 1000,
    big: 1500,
    huge: 2000,
  }
  const { lessThan, greaterThan, between } = useBreakpoint(customBreakpoints)
  return (
    <div>
      {lessThan('ok') && <div>Shown if less than {customBreakpoints['ok']} (ok)</div>}
      {greaterThan('ok') && <div>Shown if greater than {customBreakpoints['ok']} (ok)</div>}

      {between('ok', 'huge') && (
        <div>
          Shown if between {customBreakpoints['ok']} (ok) and {customBreakpoints['huge']} (huge)
        </div>
      )}
    </div>
  )
}

stories.add('Breakpoints', () => {
  return (
    <StoryPage>
      {Md`
# Breakpoints

Breakpoint values can be accessed through \`theme.breakpoints\`. Breakpoint names correspond t-shirt size - labelled breakpoints provided
in [Figma](https://www.figma.com/file/RCES4zjE1dNs2Z1ghQ8xda/%F0%9F%8C%8A---Hydro-Library?node-id=864%3A6687).


~~~jsx
import { theme } from '@/dfds-ui/theme/src'

theme.breakpoints.m // "767px";
~~~

## Media

These values can be consumed by importing \`media\` from \`@/dfds-ui/theme/srcs\`. It uses
[mrmartineau/emotion-media-query](https://github.com/mrmartineau/emotion-media-query) to offer
common patterns for using breakpoints in your styles.

### Less than

\`media.lessThan(breakpoint)\` allows applying certain style for viewports below the specified breakpoint.

In the below example, the square will become blue on viewports than are less than l breakpoint (1025px).

~~~jsx
import { media } from '@/dfds-ui/theme/src'
import styled from '@emotion/styled'

const Box = styled.div\`
  border: 2px dotted \${theme.colors.status.warning};

  \${media.lessThan('l')\`
    background: \${theme.colors.secondary.main};
  \`}
~~~
`}
      <ExampleContainer headline="Less than">
        <LessThanMediaDemo />
      </ExampleContainer>
      {Md`
### Greater than

In this example, the square will become blue on viewports than are more than m breakpoint (767px).

~~~jsx
const Box = styled.div\`
  border: 2px dotted \${theme.colors.status.warning};

  \${media.greaterThan('m')\`
    background: \${theme.colors.secondary.main};
  \`}
~~~

`}
      <ExampleContainer headline="Greater than">
        <GreaterThanMediaDemo />
      </ExampleContainer>
      {Md`
### Between

Method "between" allows applying styles between two breakpoints. Below the style will apply on viewports than tare larger than
m breakpoint (767px), but no larger than the l breakpoint (1025px).

~~~jsx
const Box = styled.div\`
  border: 2px dotted \${theme.colors.status.warning};

  \${media.greaterThan('m', 'l')\`
    background: \${theme.colors.secondary.main};
  \`}
~~~

`}
      <ExampleContainer headline="Between">
        <BetweenMediaDemo />
      </ExampleContainer>

      {Md`

## Generate media

The default media works based on default breakpoints defined in the theme package. \`generateMedia\` can be used to supply
custom breakpoints to use in the same manner as above.

In the following example, the square will become blue when the viewport is less than 555px.

~~~jsx
import { generateMedia } from '@/dfds-ui/theme/src'

const customMedia = generateMedia({
  customBreakpoint: 555
})

const Box = styled.div\`

  \${customMedia.lessThan('customBreakpoint')\`
    background: \${theme.colors.secondary.main};
  \`}
\`
~~~
`}

      <ExampleContainer headline="Custom breakpoint">
        <CustomBreakpointDemo />
      </ExampleContainer>
      {Md`

## useBreakpoint hook

### warning: Only use this if you for some reason cannot use media queries. useBreakpoint is executed in js, meaning it will execute after css in rendering cycle and will probably cause your layout to flash in some viewports. It is also knows to cause other problems with SSR(gatsby)

useBreakpoint hook is a way to consume screen breakpoints programmatically. When used without passing a parameter to the hook, it will
use breakpoints defined in \`@/dfds-ui/theme/src\`. \`useBreakpoint()\`returns an object with the folloing properties (note that the names of breakpoints below are given for default theme breakpoints and, if custom breakpoint object is passed to the hook, the names will be declared in that object):

| Key        | Type     | Description
|------------|----------|---------------------------------------------------------|
|lessThan    | function | Accepts name of breakpoint (s, m, l, xl) and returns \`boolean\` based on whether the given viewport is less than the breakpoint value.|
|greaterThan | function | Accepts name of breakpoint (s, m, l, xl) and returns \`boolean\` based on whether the given viewport is greater than the breakpoint value.|
|between     | function | Accepts two breakpoint names (s, m, l, xl)  and returns \`boolean\` based on whether the given viewport is between the two breakpoint values.|
|width       | number   | Current viewport width

~~~jsx
import { useBreakpoint } from '@/dfds-ui/theme/src'

const UseBreakpointDemo = () => {
  const { lessThan, greaterThan, between } = useBreakpoint()
  return (
    <div>
      {lessThan('m') && <div>Shown if less than {theme.breakpoints['m']} (m)</div>}
      {greaterThan('m') && <div>Shown if greater than {theme.breakpoints['m']} (m)</div>}
      {between('m', 'l') && (
        <div>
          Shown if between {theme.breakpoints['m']} (m) and {theme.breakpoints['l']} (m)
        </div>
      )}
    </div>
  )
}
~~~
`}
      <ExampleContainer headline="useBreakpoints with default breakpoints">
        <UseBreakpointDemo />
      </ExampleContainer>
      {Md`
This hook can also be used with custom breakpoint values by simplying passing a breakpoint object as an argument.

~~~jsx
const UseBreakpointWithCustomDemo = () => {
  const customBreakpoints = {
    small: 500,
    ok: 1000,
    big: 1500,
    huge: 2000,
  }
  const { lessThan, greaterThan, between } = useBreakpoint(customBreakpoints)
  return (
    <div>
      {lessThan('ok') && <div>Shown if less than {customBreakpoints['ok']} (ok)</div>}
      {greaterThan('ok') && <div>Shown if greater than {customBreakpoints['ok']} (ok)</div>}
      {between('ok', 'huge') && (
        <div>
          Shown if between {customBreakpoints['ok']} (ok) and {customBreakpoints['huge']} (huge)
        </div>
      )}
    </div>
  )
}
~~~`}
      <ExampleContainer headline="useBreakpoints with custom breakpoints">
        <UseBreakpointWithCustomDemo />
      </ExampleContainer>
    </StoryPage>
  )
})
