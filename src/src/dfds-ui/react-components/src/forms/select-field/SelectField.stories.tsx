/* eslint-disable deprecation/deprecation */
import React from 'react'
import { storiesOf } from '@storybook/react'
import SelectField from './SelectField'
import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'
import { Lock } from '@/dfds-ui/react-components/src'
import { css } from '@emotion/react'
import { Dropdown, MenuItem } from '../../dropdown-menu'

const stories = storiesOf('Legacy/SelectField', module)

const DropdownStory: React.FunctionComponent = () => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('Select')
  const [selected1, setSelected1] = React.useState(false)
  const [selected2, setSelected2] = React.useState(false)
  const [selected3, setSelected3] = React.useState(false)
  const [selected4, setSelected4] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)
  const handleClick = (event: any) => {
    ref.current = event.currentTarget
    setOpen((open) => !open)
  }
  const getSelectionText = (event: any) => {
    setValue(event.currentTarget.textContent)
  }
  const handleClose = () => {
    ref.current = null
    setOpen(false)
  }
  React.useEffect(() => {
    if (selected1) {
      setSelected2(false)
      setSelected3(false)
      setSelected4(false)
    } else if (selected2) {
      setSelected1(false)
      setSelected3(false)
      setSelected4(false)
    } else if (selected3) {
      setSelected1(false)
      setSelected2(false)
      setSelected4(false)
    } else if (selected4) {
      setSelected1(false)
      setSelected2(false)
      setSelected3(false)
    } else {
      setSelected1(false)
      setSelected2(false)
      setSelected3(false)
      setSelected4(false)
    }
  }, [value, selected1, selected2, selected3, selected4])
  return (
    <div
      css={css`
        display: flex;
        width: 100%;
        min-height: 25vh;
        /* FIXME: top doesn't seem to be valid for align-items */
        /* stylelint-disable */
        align-items: top;
        /* stylelint-enable */
        justify-content: center;
      `}
    >
      <div
        css={css`
          width: 157px;
        `}
      >
        <SelectField
          as="input"
          name="select"
          label="Select field"
          value={value}
          onClick={handleClick}
          onChange={getSelectionText}
        />
        <Dropdown
          isOpen={open}
          setIsOpen={setOpen}
          anchorEl={ref.current}
          onClickAway={handleClose}
          placement="bottom-start"
          shouldCloseOnEsc
        >
          <MenuItem
            clickable
            onClick={(event: any) => {
              setSelected1((selected1) => !selected1)
              getSelectionText(event)
              handleClose()
            }}
            selected={selected1}
          >
            Option one
          </MenuItem>
          <MenuItem
            clickable
            onClick={(event: any) => {
              setSelected2((selected2) => !selected2)
              getSelectionText(event)
              handleClose()
            }}
            selected={selected2}
          >
            Option two
          </MenuItem>
          <MenuItem
            clickable
            onClick={(event: any) => {
              setSelected3((selected3) => !selected3)
              getSelectionText(event)
              handleClose()
            }}
            selected={selected3}
          >
            Option three
          </MenuItem>
          <MenuItem
            clickable
            onClick={(event: any) => {
              setSelected4((selected4) => !selected4)
              getSelectionText(event)
              handleClose()
            }}
            selected={selected4}
          >
            Option four
          </MenuItem>
        </Dropdown>
      </div>
    </div>
  )
}

stories.add('SelectField', () => (
  <StoryPage>
    {Md`
# SelectField
\`SelectField\` is a high level composite component for text input
`}
    <ExampleContainer headline="Basic usage">
      <SelectField name="select1" label="Label">
        <option value="">Pick</option>
        <option>Value</option>
      </SelectField>
      {Md`
~~~jsx
import { SelectField } from '@/dfds-ui/react-components/src';

<SelectField name="select1" label="Label" >
  <option value="">Pick</option>
  <option>Value</option>
</SelectField>
~~~
`}
    </ExampleContainer>
    {Md`
## Displaying Hint (placeholder) and assistive text
Use the \`hintText\`, \`assistiveText\` and \`inverted\` props to set the placeholder text and assistive information for the input
    `}
    <ExampleContainer>
      <SelectField name="select2" label="Label" assistiveText="Assistive text">
        <option value="">Pick</option>
        <option>Value</option>
      </SelectField>
      <div
        css={css`
          background-color: #002b45;
          padding: 10px;
        `}
      >
        <SelectField name="select2" label="Label" inverted assistiveText="Assistive text">
          <option value="">Pick</option>
          <option>Value</option>
        </SelectField>
      </div>
      {Md`
~~~jsx
import { SelectField } from '@/dfds-ui/react-components/src';

<SelectField name="select2" label="Label" assistiveText="Assistive text">
  <option value="">Pick</option>
  <option>Value</option>
</SelectField>

<SelectField name="select2" label="Label" inverted assistiveText="Assistive text">
  <option value="">Pick</option>
  <option>Value</option>
</SelectField>

`}
    </ExampleContainer>
    {Md`
## Displaying error and assistive text
Use the \`errorMessage\` and \`assistiveText\` props to set the error text and assistive information for the input
    `}
    <ExampleContainer>
      <SelectField name="select3" label="Label" errorMessage="Error" assistiveText="Assistive text">
        <option value="">Pick</option>
        <option>Value</option>
      </SelectField>

      {Md`
~~~jsx
import { SelectField } from '@/dfds-ui/react-components/src';

<SelectField name="select3" label="Label" errorMessage="Error" assistiveText="Assistive text">
  <option value="">Pick</option>
  <option>Value</>
</SelectField>
`}
    </ExampleContainer>

    {Md`
## Displaying Small version
Use the \`size\` to set to Small version, used by the B2B team
    `}
    <ExampleContainer>
      <SelectField name="select4" size="small" label="Label">
        <option value="">Pick</option>
        <option>Value</option>
      </SelectField>

      {Md`
~~~jsx
import { SelectField } from '@/dfds-ui/react-components/src';

<SelectField name="select3" label="Label" size="small">
  <option value="">Pick</option>
  <option>Value</>
</SelectField>
`}
    </ExampleContainer>

    {Md`
## Set value
Use the \`value\` to set initial value
    `}
    <ExampleContainer>
      <SelectField name="select4" label="Label" defaultValue="1">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </SelectField>

      {Md`
~~~jsx
import { SelectField } from '@/dfds-ui/react-components/src';

<SelectField name="select3" label="Label" value="1">
  <option value="">Pick</option>
  <option>Value</>
</SelectField>
`}
    </ExampleContainer>
    {Md`
## Displaying alternative icon
Use the \`icon\` to set to change the icon
    `}
    <ExampleContainer>
      <SelectField name="select5" label="Label" icon={<Lock />}>
        <option value="">Pick</option>
        <option>Value</option>
      </SelectField>

      {Md`
~~~jsx
import { SelectField } from '@/dfds-ui/react-components/src';

<SelectField name="select3" label="Label" icon={<Lock />}>
  <option value="">Pick</option>
  <option>Value</>
</SelectField>
`}
    </ExampleContainer>
    {Md`
## Displaying alternative dropdown
Use the \`Dropdown\` component instead of the default dropdown
    `}
    <ExampleContainer>
      <DropdownStory />

      {Md`
~~~jsx
import { SelectField } from '@/dfds-ui/react-components/src';
import { Dropdown, MenuItem } from '@/dfds-ui/react-components/src';

const SelectFieldWithDropdown = () => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('Select')
  const [selected1, setSelected1] = React.useState(false)
  const [selected2, setSelected2] = React.useState(false)
  const [selected3, setSelected3] = React.useState(false)
  const [selected4, setSelected4] = React.useState(false)
  const ref = React.useRef(null)
  const handleClick = (event: any) => {
    ref.current = event.currentTarget
    setOpen((open) => !open)
  }
  const getSelectionText = (event: any) => {
    setValue(event.currentTarget.textContent)
  }
  const handleClose = () => {
    ref.current = null
    setOpen(false)
  }
  React.useEffect(() => {
    if (selected1) {
      setSelected2(false)
      setSelected3(false)
      setSelected4(false)
    } else if (selected2) {
      setSelected1(false)
      setSelected3(false)
      setSelected4(false)
    } else if (selected3) {
      setSelected1(false)
      setSelected2(false)
      setSelected4(false)
    } else if (selected4) {
      setSelected1(false)
      setSelected2(false)
      setSelected3(false)
    } else {
      setSelected1(false)
      setSelected2(false)
      setSelected3(false)
      setSelected4(false)
    }
  }, [value, selected1, selected2, selected3, selected4])
  return (
        <div>
        <SelectField
          as="input"
          name="select"
          label="Select field"
          onClick={handleClick}
          value={value}
          onChange={getSelectionText}
        />
        <Dropdown
          isOpen={open}
          setIsOpen={setOpen}
          anchorEl={ref.current}
          onClickAway={handleClose}
          placement="bottom-start"
        >
          <MenuItem
            clickable
            onClick={(event: any) => {
              setSelected1((selected1) => !selected1)
              getSelectionText(event)
              handleClose()
            }}
            selected={selected1}
          >
            Option one
          </MenuItem>
          <MenuItem
            clickable
            onClick={(event) => {
              setSelected2((selected2) => !selected2)
              getSelectionText(event)
              handleClose()
            }}
            selected={selected2}
          >
            Option two
          </MenuItem>
          <MenuItem
            clickable
            onClick={(event) => {
              setSelected3((selected3) => !selected3)
              getSelectionText(event)
              handleClose()
            }}
            selected={selected3}
          >
            Option three
          </MenuItem>
          <MenuItem
            clickable
            onClick={(event) => {
              setSelected4((selected4) => !selected4)
              getSelectionText(event)
              handleClose()
            }}
            selected={selected4}
          >
            Option four
          </MenuItem>
        </Dropdown>
        </div>
  )
}
~~~
`}
    </ExampleContainer>
  </StoryPage>
))
