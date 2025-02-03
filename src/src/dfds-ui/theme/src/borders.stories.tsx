import React from 'react'
import { storiesOf } from '@storybook/react'
import styled from '@emotion/styled'
import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import theme from './theme'

const stories = storiesOf('Hydro Theme/Borders', module)

type BorderWidth = keyof typeof theme.borders.widths

const BorderDemo = styled.div<{ borderWidth: BorderWidth }>`
  height: 56px;
  width: 56px;

  border: ${(p) => theme.borders.widths[p.borderWidth]} solid ${theme.colors.tertiary.dark};
`

stories.add('Borders', () => {
  return (
    <StoryPage>
      {Md`
# Borders

The Design system has the three following border widths:

### s - 0dp
`}
      <ExampleContainer headline="1px">
        <BorderDemo borderWidth="s" />
      </ExampleContainer>
      {Md`

### m - 2px
`}
      <ExampleContainer headline="2px">
        <BorderDemo borderWidth="m" />
      </ExampleContainer>
      {Md`

### l - 8px
`}
      <ExampleContainer headline="4px">
        <BorderDemo borderWidth="l" />
      </ExampleContainer>
    </StoryPage>
  )
})
