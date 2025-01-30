import { FlexBox } from '@dfds-ui/react-components/flexbox'
import { Story } from '@storybook/react'
import React, { useState } from 'react'
import { TextareaField, TextareaFieldProps } from './TextareaField'
import { css } from '@emotion/react'

const ArgsTemplate: Story<TextareaFieldProps> = (args) => <TextareaField {...args} />
export const TextareaUsage = ArgsTemplate.bind({})
TextareaUsage.args = {
  name: 'textarea-controls',
  label: 'Label',
  placeholder: 'Hint',
}

export const SimpleTextareaField = () => {
  return (
    <>
      <TextareaField
        name="basic-textarea"
        label="Label"
        placeholder="Hint"
        assistiveText="Assistive text."
        defaultValue="Initial value"
        maxValueLength={300}
        help="Help text."
        required
      />
      <TextareaField
        name="basic-textarea"
        label="Label"
        placeholder="Hint"
        assistiveText="Assistive text."
        defaultValue="Initial value"
        maxValueLength={300}
        required
        help="Help text."
        disabled
      />
    </>
  )
}

export const ControlledTextareaField = () => {
  const [value, setValue] = useState('Initial value')
  return (
    <TextareaField
      name="textarea-controlled"
      label="Label"
      placeholder="Hint"
      maxValueLength={200}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
    />
  )
}

export const SizesTextareaField = () => {
  return (
    <FlexBox>
      <FlexBox
        css={css`
          flex: 1;
        `}
      >
        <TextareaField
          name="small-textarea"
          label="Small"
          assistiveText="Assistive text."
          placeholder="Hint"
          defaultValue="Initial value"
          maxValueLength={300}
          required
          size="small"
        />
      </FlexBox>
      <FlexBox
        css={css`
          flex: 1;
        `}
      >
        <TextareaField
          name="medium-textarea"
          label="Medium"
          assistiveText="Assistive text."
          placeholder="Hint"
          defaultValue="Initial value"
          maxValueLength={300}
          required
          size="medium"
        />
      </FlexBox>
    </FlexBox>
  )
}

export const UnlimitedSizeTextareaField = () => {
  return <TextareaField name="unlimited-textarea" label="Label" placeholder="Hint" assistiveText="Assistive text." />
}

export const AssistiveErrorTextareaField = () => {
  return (
    <FlexBox justifySpaceBetween>
      <TextareaField name="assistive-textarea" label="Label" placeholder="Hint" assistiveText="Assistive text." />
      <TextareaField
        name="error-textarea"
        label="Label"
        placeholder="Hint"
        assistiveText="Overriden assistive text"
        errorMessage="Error text."
      />
      <TextareaField name="notext-textarea" label="Label" placeholder="Hint" />
    </FlexBox>
  )
}

export const DifferentHeight = () => {
  return (
    <FlexBox justifySpaceBetween>
      <TextareaField name="ta1" label="Label" placeholder="Hint" rows={2} />
      <TextareaField name="ta2" label="Label" placeholder="Hint" />
      <TextareaField name="ta3" label="Label" placeholder="Hint" rows={4} />
    </FlexBox>
  )
}
