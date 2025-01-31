import React from 'react'
import { FieldWrap, FieldWrapProps } from './FieldWrap'
import { Story } from '@storybook/react'
import { Skeleton } from '@/components/dfds-ui/react-components'
import { css } from '@emotion/react'

const ArgsTemplate: Story<FieldWrapProps> = (args) => (
  <FieldWrap {...args}>
    <Skeleton
      variant="text"
      css={css`
        height: 50px;
        width: 100%;
      `}
    />
  </FieldWrap>
)
export const Usage = ArgsTemplate.bind({})
Usage.args = {
  name: 'usage',
  label: 'Label',
  size: 'medium',
  assistiveText: 'Assistive text.',
}
