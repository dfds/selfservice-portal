import React from 'react'
import { storiesOf } from '@storybook/react'
import styled from '@emotion/styled'

import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import theme from './theme'

const stories = storiesOf('Hydro Theme/Radii', module)

type Radius = keyof typeof theme.radii

const RadiusDemo = styled.div<{ radius: Radius }>`
  height: 56px;
  width: 56px;
  background-color: ${theme.colors.status.warning};
  border-radius: ${(p) => theme.radii[p.radius]};
`

stories.add('Radii', () => {
  return (
    <StoryPage>
      {Md`
# Radii

~~~jsx
import { theme } from '@/dfds-ui/theme/src'
~~~

The radii are accessible under \`theme.radii\` as follows:

~~~js
theme.radii.m // 2px;
~~~


The Design system has the two following radii:

### m - 2px
`}
      <ExampleContainer headline="2px">
        <RadiusDemo radius="m" />
      </ExampleContainer>
      {Md`

### l - 8px
`}
      <ExampleContainer headline="8px">
        <RadiusDemo radius="l" />
      </ExampleContainer>
    </StoryPage>
  )
})
