/* eslint-disable react/jsx-key */
import React from 'react'
import { storiesOf } from '@storybook/react'
import { css } from '@emotion/react'
import { StoryPage, Md } from '@/dfds-ui/storybook-design'
import { SpacingKey, SpacingValue } from '@/dfds-ui/spacing/src'
import theme from './theme'

const stories = storiesOf('Hydro Theme/Spacing', module)

type SpacingDemoElementProps = {
  label: SpacingKey
  size: SpacingValue
}

const SpacingDemoElement: React.FunctionComponent<SpacingDemoElementProps> = ({ label, size }) => (
  <div
    css={css`
      > span {
        font-weight: lighter;
      }

      > div {
        height: ${size}px;
        margin: 0.5rem 0 1.5rem 0;
        width: 100%;
        background-color: ${theme.colors.secondary.main};
      }
    `}
  >
    <span>
      <strong>{label}</strong> - {size}
    </span>
    <div />
  </div>
)

stories.add('Spacing', () => {
  return (
    <StoryPage>
      {Md`
# Spacing

Spacing properties can be accessed through the \`theme\`. Rem values are based on the assumption that the base font-size is 16px.


~~~jsx
import { theme } from '@/dfds-ui/theme/src'
~~~

The following spacing options are available:

`}
      {Object.entries(theme.spacing).map(([label, size]: any, index: number) => (
        <SpacingDemoElement key={index} label={label} size={size} />
      ))}
    </StoryPage>
  )
})
