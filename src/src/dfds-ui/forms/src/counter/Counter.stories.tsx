import React, { useState } from 'react'
import { Story } from '@storybook/react'
import { Text } from '@/dfds-ui/typography/src'
import { Counter, CounterProps } from './Counter'
import { css } from '@emotion/react'

const ArgsTemplate: Story<CounterProps> = (args) => <Counter {...args} />
export const SimpleCounter = ArgsTemplate.bind({})
SimpleCounter.args = {
  minValue: 0,
  maxValue: 10,
}

export const CustomTextCounter = () => {
  const [count, setCount] = useState(0)
  const text = `Rooms: ${count}`
  return <Counter minValue={0} maxValue={10} onChange={setCount} text={text} />
}

export const CounterWithLabelsStory = () => (
  <div
    css={css`
      width: 260px;
    `}
  >
    <div
      css={css`
        display: flex;
        justify-content: space-between;
      `}
    >
      <div
        css={css`
          display: flex;
          justify-content: center;
          flex-direction: column;
        `}
      >
        <Text
          css={css`
            margin: 0 0;
          `}
          styledAs={'actionBold'}
        >
          Adults
        </Text>
        <Text
          css={css`
            margin: 0 0;
          `}
          styledAs={'label'}
        >
          +16
        </Text>
      </div>
      <Counter minValue={0} maxValue={10} />
    </div>
    <div
      css={css`
        display: flex;
        justify-content: space-between;
      `}
    >
      <div
        css={css`
          display: flex;
          justify-content: center;
          flex-direction: column;
        `}
      >
        <Text
          css={css`
            margin: 0 0;
          `}
          styledAs={'actionBold'}
        >
          Children
        </Text>
        <Text
          css={css`
            margin: 0 0;
          `}
          styledAs={'label'}
        >
          0-15
        </Text>
      </div>
      <Counter minValue={0} maxValue={10} />
    </div>
  </div>
)
