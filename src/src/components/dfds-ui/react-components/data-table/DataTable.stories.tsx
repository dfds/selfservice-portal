import React from 'react'
import { storiesOf } from '@storybook/react'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'
import DataTable from './DataTable'

const stories = storiesOf('Legacy/Data Tables', module)
const tableData = [
  {
    id: 1,
    name: 'Example Name',
    age: 21,
    email: 'example@email.com',
  },
  {
    id: 2,
    name: 'Example Name',
    age: 19,
    email: 'example@email.com',
  },
]

const tableDataWithField = [
  {
    field: {
      type: 'checkbox',
      name: 'title',
      label: 'Title',
      value: false,
    },
    id: 1,
    name: 'Example Name',
    age: 21,
    email: 'example@email.com',
  },
  {
    field: {
      type: 'checkbox',
      name: 'title',
      label: 'Title',
      value: true,
    },
    id: 2,
    name: 'Example Name',
    age: 19,
    email: 'example@email.com',
  },
]

const customColumns = ['Custom Id', 'Custom Name', 'Custom Age', 'Custom email']

stories.add('Table', () => {
  return (
    <>
      <StoryPage>
        {Md`
# Table
### Table component with default settings
`}
        <ExampleContainer>
          <DataTable data={tableData} />
          {Md`
~~~jsx
import { Table } from '@/components/dfds-ui/react-components';

const tableData = [
  {
    id: 1,
    name: 'Example Name',
    age: 21,
    email: 'example@email.com'
  },
  {
    id: 2,
    name: 'Example Name',
    age: 19,
    email: 'example@email.com'
  }
];

<Table data={tableData} />
~~~
`}
        </ExampleContainer>
        {Md`
  ### Table component with hasHeader property
  By default, when the \`hasHeader\` property is passed as true, but no columns are provided, the table will create the header columns based on the
  keys of the first row object
`}
        <ExampleContainer>
          <DataTable data={tableData} hasHeader />
          {Md`
~~~jsx
import { Table } from '@/components/dfds-ui/react-components';

const tableData = [
  {
    id: 1,
    name: 'Example Name',
    age: 21,
    email: 'example@email.com'
  },
  {
    id: 2,
    name: 'Example Name',
    age: 19,
    email: 'example@email.com'
  }
];

<Table data={tableData} hasHeader />
~~~
`}
        </ExampleContainer>
        {Md`
  ### Table component with hasHeader property and custom header columns
  We also have the option to pass a custom header columns array to be shown in the table header
`}
        <ExampleContainer>
          <DataTable data={tableData} hasHeader columns={customColumns} />
          {Md`
~~~jsx
import { Table } from '@/components/dfds-ui/react-components';

const tableData = [
  {
    id: 1,
    name: 'Example Name',
    age: 21,
    email: 'example@email.com'
  },
  {
    id: 2,
    name: 'Example Name',
    age: 19,
    email: 'example@email.com'
  }
];
const customColumns = ['Custom Id', 'Custom Name', 'Custom Age', 'Custom email']
<Table data={tableData} hasHeader columns={customColumns}/>
~~~
`}
        </ExampleContainer>
        {Md`
  ### Table component containing a checkbox component
  The table supports a field being passed. For now, only checkbox components are supported.
`}
        <ExampleContainer>
          <DataTable data={tableDataWithField} />
          {Md`
~~~jsx
import { Table } from '@/components/dfds-ui/react-components';

const tableData = [
  {
    field: {
      type: 'checkbox',
      name: 'title',
      label: 'Title',
      value: false,
    },
    id: 1,
    name: 'Example Name',
    age: 21,
    email: 'example@email.com',
  },
  {
    field: {
      type: 'checkbox',
      name: 'title',
      label: 'Title',
      value: true,
    },
    id: 2,
    name: 'Example Name',
    age: 19,
    email: 'example@email.com',
  },
];
<Table data={tableData}/>
~~~
`}
        </ExampleContainer>
      </StoryPage>
    </>
  )
})
