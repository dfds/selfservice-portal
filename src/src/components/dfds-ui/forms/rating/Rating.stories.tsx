import React, { useState } from 'react'
import { RatingField, RatingFieldProps } from './Rating'
import { Story } from '@storybook/react'
import { Text } from '@/components/dfds-ui/typography'
import { Star } from '@dfds-ui/icons/system'

const ArgsTemplate: Story<RatingFieldProps> = (args) => <RatingField {...args} />
export const Usage = ArgsTemplate.bind({})
Usage.args = {
  name: 'usage',
  label: 'Simple rating scale',
  size: 'medium',
  rangeCardinality: 8,
}

Usage.parameters = { controls: { include: Object.keys(Usage.args) } }

export const Basic = () => {
  return (
    <>
      <Text>
        5. How will the following barriers limit your ability to reach your supply chain goals in the coming year?
      </Text>

      <RatingField name="finBarriers" label="Financial barriers" size="medium" rangeCardinality={10} />
      <RatingField
        name="legBarriers"
        label="Legal barriers"
        size="medium"
        rangeCardinality={10}
        assistiveText="Assistive text."
      />
    </>
  )
}

export const Controlled = () => {
  const [value, setValue] = useState(4)

  return (
    <RatingField
      name="rateExp"
      label="Satisfaction"
      size="medium"
      rangeCardinality={5}
      leadingHint="Bad"
      trailingHint="Good"
      value={value}
      onChange={(k, _e) => setValue(k)}
    />
  )
}

export const CustomScaleLabels = () => {
  const ordinalSuffix = (value: number) => {
    if (value === 1) return 'st'
    if (value === 2) return 'nd'
    if (value === 3) return 'rd'
    return 'th'
  }
  const labelFn = (index: number) => `${index + 1}${ordinalSuffix(index + 1)}`
  return (
    <>
      <RatingField name="customLabel1" label="Best option" size="medium" rangeCardinality={10} scaleLabels={labelFn} />
    </>
  )
}

export const CumulativeIcons = () => {
  const [value, setValue] = useState(3)
  return (
    <>
      <RatingField
        name="stars"
        label="Rate your experience"
        rangeCardinality={5}
        Icon={() => Star}
        size="medium"
        defaultValue={3}
        cumulative
      />
      <RatingField
        name="stars-disabled"
        label="Rate your experience (disabled)"
        rangeCardinality={5}
        Icon={() => Star}
        size="medium"
        cumulative
        disabled
      />
      <RatingField
        name="stars-hints"
        leadingHint="Bad"
        trailingHint="Good"
        label="Rate your experience"
        rangeCardinality={5}
        value={value}
        onChange={(k) => setValue(k)}
        Icon={() => Star}
        size="medium"
        cumulative
      />
    </>
  )
}
