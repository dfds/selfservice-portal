import React from 'react'
import { storiesOf } from '@storybook/react'
import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import ProgressBar from './ProgressBar'

const stories = storiesOf('Hydro UI/Loading Indicators/ProgressBar', module)

stories.add('Linear', () => (
  <StoryPage>
    {Md`
# Linear Progress bar

Progress bar can be used both for creating perception of the progress where the total time of the
action is known / the current progress is known, as well as in cases where neither of the aforementioned are known,
in which case an "indeterminate" flag must be passed to the component.


~~~jsx
import { ProgressBar } from '@/dfds-ui/react-components/src'
~~~

## Props
| Name          | Values            | Description                                                                |
|---------------|-------------------|----------------------------------------------------------------------------|
|progress       | number: 0 - 100   | Fill level of the progress bar. Default: 0                                 |
|indeterminate  | boolean           | Displays indeterminate progress bar, negates progress prop. Default: 0     |
|light          | boolean           | Light variation of the prgoress bar

Progress bar with determined progress

~~~jsx
<ProgressBar progress={10} />
<ProgressBar progress={75} light />
~~~`}
    <ExampleContainer headline="10% complete">
      <ProgressBar progress={10} />
    </ExampleContainer>
    <ExampleContainer headline="75% complete | light variation" dark>
      <ProgressBar light progress={75} />
    </ExampleContainer>
    {Md`
Progress bar with indeterminate progress

~~~jsx
<ProgressBar indeterminate />
<ProgressBar indeterminate light />
~~~`}
    <ExampleContainer headline="indeterminate">
      <ProgressBar indeterminate />
    </ExampleContainer>
    <ExampleContainer headline="indeterminate | light variation" dark>
      <ProgressBar indeterminate light />
    </ExampleContainer>
  </StoryPage>
))
