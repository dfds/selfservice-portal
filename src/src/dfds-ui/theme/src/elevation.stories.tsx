import React from 'react'
import { storiesOf } from '@storybook/react'
import styled from '@emotion/styled'

import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import theme from './theme'

const stories = storiesOf('Hydro Theme/Elevation', module)

type Elevation = keyof typeof theme.elevation

const ElevationDemo = styled.div<{ elevation: Elevation }>`
  height: 56px;
  width: 56px;
  box-shadow: ${(p) => theme.elevation[p.elevation]};
`

stories.add('Elevation', () => {
  return (
    <StoryPage>
      {Md`
# Elevation

~~~jsx
import { theme } from '@/dfds-ui/theme/src'
~~~

Elevation is a value of a box shadow for an element. Elevation values are accessible under the \`theme.elevation\` namespace
as follows:

~~~js
theme.elevation.4 // 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 4px 5px 0 rgba(0, 0, 0, 0.14);
~~~


The Design system has the three following elevation styles:

### 4
`}
      <ExampleContainer headline="4dp">
        <ElevationDemo elevation="4" />
      </ExampleContainer>
      {Md`

### 8
`}
      <ExampleContainer headline="8dp">
        <ElevationDemo elevation="8" />
      </ExampleContainer>
      {Md`

### 16
`}
      <ExampleContainer headline="16dp">
        <ElevationDemo elevation="16" />
      </ExampleContainer>
    </StoryPage>
  )
})
