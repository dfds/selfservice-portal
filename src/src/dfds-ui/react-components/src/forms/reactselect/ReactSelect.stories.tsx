/* eslint-disable deprecation/deprecation */
import React from 'react'
import { storiesOf } from '@storybook/react'
import ReactSelect from '../reactselect/ReactSelect'
import { components } from 'react-select'
import Lock from '@/dfds-ui/react-components/src/core/Lock'
import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import { css } from '@emotion/react'

const stories = storiesOf('Legacy/ReactSelect', module)
const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
]

const optionsDates = [
  { value: '1', label: ['Jul 03, 08:00', 'Jul 05, 13:40'] },
  { value: '2', label: ['Jul 03, 12:00', 'Jul 05, 17:30'] },
  { value: '3', label: ['Jul 04, 08:00', 'Jul 06, 13:40'] },
  { value: '4', label: ['Jul 04, 12:00', 'Jul 06, 17:40'], disabled: 'yes' },
]

const menuNewRowStyle = css`
  clear: both;
  height: 40px;
`

const menuHeaderStyle = css`
  border-bottom: 1px solid black;
  width: 50%;
  padding-left: 20px;
  font-size: 12px;
  font-weight: bold;
  float: left;
  height: 40px;
  line-height: 40px;
`

const menuDateStyle = css`
  width: 50%;
  padding-left: 20px;
  float: left;
  height: 40px;
  line-height: 40px;
`
const menuListStyle = css`
  .react-select__option {
    border-bottom: 1px solid #b8b8b7;
    padding: 0;
  }
`

const MenuList = (props: any) => {
  return (
    <components.MenuList css={menuListStyle} {...props}>
      <div css={menuNewRowStyle}>
        <div css={menuHeaderStyle}>Depature</div>
        <div css={menuHeaderStyle}>Arrival</div>
      </div>
      {props.children}
    </components.MenuList>
  )
}

const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <div css={menuNewRowStyle}>
        <div css={menuDateStyle}>{props.children[0]}</div>
        <div css={menuDateStyle}>{props.children[1]}</div>
      </div>
    </components.Option>
  )
}

const SingleValue = ({ children, ...props }: any) => {
  return (
    <components.SingleValue {...props}>
      {children[0]} - {children[1]}
    </components.SingleValue>
  )
}

stories.add('ReactSelect', () => {
  return (
    <StoryPage>
      {Md`
# ReactSelect
SelectReact is a low level component for wrapping \`<react-select>\` elements
`}
      <ExampleContainer headline="Basic usage">
        <ReactSelect
          name="select"
          options={optionsDates}
          isOptionDisabled={(option: any) => option.disabled === 'yes'}
          components={{ MenuList, Option, SingleValue }}
        />
        {Md`
~~~jsx
import { ReactSelect } from '@/dfds-ui/react-components/src';
import { components } from 'react-select'

const optionsDates = [
  { value: '1', label: ['Jul 03, 08:00', 'Jul 05, 13:40'] },
  { value: '2', label: ['Jul 03, 12:00', 'Jul 05, 17:30'] },
  { value: '3', label: ['Jul 04, 08:00', 'Jul 06, 13:40'] },
  { value: '4', label: ['Jul 04, 12:00', 'Jul 06, 17:40'], disabled: 'yes' },
]

const menuNewRowStyle = css\`
  clear: both;
  height: 40px;
  .option--is-focused {
  }
\`

const menuHeaderStyle = css\`
  border-bottom: 1px solid black;
  width: 50%;
  padding-left: 20px;
  font-size: 12px;
  font-weight: bold;
  float: left;
  height: 40px;
  line-height: 40px;
\`

const menuDateStyle = css\`
  width: 50%;
  padding-left: 20px;
  float: left;
  height: 40px;
  line-height: 40px;
\`

const menuListStyle = css\`
  .react-select__option {
    border-bottom: 1px solid #b8b8b7;
    padding: 0;
  }
\`

const MenuList = (props: any) => {
  return (
    <components.MenuList css={menuListStyle} {...props}>
      <div css={menuNewRowStyle}>
        <div css={menuHeaderStyle}>Depature</div>
        <div css={menuHeaderStyle}>Arrival</div>
      </div>
      {props.children}
    </components.MenuList>
  )
}

const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <div css={menuNewRowStyle}>
        <div css={menuDateStyle}>{props.children[0]}</div>
        <div css={menuDateStyle}>{props.children[1]}</div>
      </div>
    </components.Option>
  )
}

const SingleValue = ({ children, ...props }: any) => {
  return (
    <components.SingleValue {...props}>
      {children[0]} - {children[1]}
    </components.SingleValue>
  )
}

<ReactSelect
          name="select"
          value={optionsDates.find(opt => opt.value === value)}
          options={optionsDates}
          isOptionDisabled={(option: any) => option.disabled === 'yes'}
          components={{ MenuList, Option, SingleValue }}
        />
`}
      </ExampleContainer>
      {Md`
## Indicating errors
Setting the \`error\` prop to \`true\` will render the select with red border indicating an error
`}
      <ExampleContainer headline="Example showing error">
        <ReactSelect name="selectError" error options={options} />
        {Md`
~~~jsx
import { ReactSelect } from '@/dfds-ui/react-components/src';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
]

<ReactSelect name="selectError" error options={options} />
`}
      </ExampleContainer>

      {Md`
## Icon
Using the \`icon\` prop to change the select icon
`}

      <ExampleContainer headline="Example showing icon in select">
        <ReactSelect name="selectIcon" icon={<Lock />} options={options} />
        {Md`
~~~jsx
import { ReactSelect } from '@/dfds-ui/react-components/src';

<ReactSelect name="selectIcon" icon={<Lock />} options={options} />
`}
      </ExampleContainer>

      {Md`
## Disabled
Using the \`disabled\` prop it's possible to disabled a select
`}

      <ExampleContainer headline="Example showing disabled select">
        <ReactSelect name="selectDisabled" disabled options={options} />
        {Md`
~~~jsx
import { ReactSelect } from '@/dfds-ui/react-components/src';



<ReactSelect name="selectDisabled" disabled options={options} />
`}
      </ExampleContainer>
      {Md`
## Size
Set the \`size\` prop to \`small\` to display a smaller version.
`}

      <ExampleContainer headline="Example showing small select">
        <ReactSelect name="selectSmall" size="small" options={options} />
        {Md`
~~~jsx
import { ReactSelect } from '@/dfds-ui/react-components/src';

<ReactSelect name="select" size="small" options={options} />
`}
      </ExampleContainer>
      {Md`
## Arrow
Set the \`arrow\` prop to \`false\` to hide the arrow adornment.
`}

      <ExampleContainer headline="No arrow">
        <ReactSelect name="select" options={options} arrow={false} />
        {Md`
~~~jsx
import { ReactSelect } from '@/dfds-ui/react-components/src';

<ReactSelect name="select" options={options} arrow={false} />
`}
      </ExampleContainer>
      {Md`
## Arrow
Set the \`arrow\` prop to \`false\` to hide the arrow adornment.
`}

      {Md`
## isClearable
Add the \`isClearable\` prop to be able to clear the select field.
`}

      <ExampleContainer headline="Is Clearable">
        <ReactSelect name="select" options={options} isClearable />
        {Md`
~~~jsx
import { ReactSelect } from '@/dfds-ui/react-components/src';
`}
      </ExampleContainer>
      {Md`
## menuPlacement
Set the \`menuPlacement\` prop to \`top\` to open the select field on top.
`}
      <ExampleContainer headline="Menu Placement">
        <ReactSelect name="select" options={options} menuPlacement="top" />
        {Md`
~~~jsx
import { ReactSelect } from '@/dfds-ui/react-components/src';
`}
      </ExampleContainer>
    </StoryPage>
  )
})
