import React from 'react'
import { storiesOf } from '@storybook/react'
import { StoryPage, Md } from '@/dfds-ui/storybook-design'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@/dfds-ui/react-components/src'

const stories = storiesOf('General/Packages/Google Places', module)

const tableData = [
  {
    name: <b>apiKey</b>,
    value: 'string',
    description: 'Google JavaScript API key',
    required: 'x',
  },
  {
    name: <b>libraries</b>,
    value: 'string',
    description: 'Comma separated string with Google libraries',
    required: '',
  },
]

stories.add('Hooks', () => {
  return (
    <StoryPage>
      {Md`
# <b>Hooks</b>

## <b>useGooglePlacesAPI</b>

The hook exposes a state object with two keys - \`available\` and \`error\`:
* \`available\` Indidcates whether Google Places API script has loaded.
* \`error\` exposes an error message, if an error has occurred.

This is a context hook working together \`GooglePlacesAPIProvider\`, which programatically loads
Google Places API script.

### <b>GooglePlacesAPIProvider props</b>`}

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Value</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Required</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((data, index) => (
            <TableRow key={index}>
              <TableDataCell>{data.name}</TableDataCell>
              <TableDataCell>{data.value}</TableDataCell>
              <TableDataCell>{data.description}</TableDataCell>
              <TableDataCell>{data.required}</TableDataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {Md`
### <b>Usage</b>

First, import \`GooglePlacesAPIProvider\` and wrap the part of application, which will consume
this context as follows:

~~~jsx
import { GooglePlacesAPIProvider } from '@/dfds-ui/hooks/src'

const App = () => (
  <div>
    <GooglePlacesAPIProvider apiKey="API_KEY" libraries="geometry,drawing,places">
      // Code that will use the context
    </GooglePlacesAPIProvider>
  </div>
)
~~~

Next the hook can be used to access the aforementioned context.

~~~jsx
import { useGooglePlacesAPI } from '@/dfds-ui/hooks/src'

const ExampleComponent = () => {
  const { available, error } = useGooglePlacesAPI();

  return (
    <div>
      Google Places API {!available || error && 'not'} available
    </div>
  )
}

const App = () => (
  <div>
    <GooglePlacesAPIProvider apiKey="API_KEY">
      <ExampleComponent />
    </GooglePlacesAPIProvider>
  </div>
)

~~~`}
      {Md`
## <b>useAddressPredictions</b>

This hook accepts two arguments \`input\` and \`types\` (optional), returns an object of array of \`predictions\` and function \`getPlacePredictions\` using
Google Places API Autocomplete Service, based on the values of the arguments provided.

* \`input\` is the query string e.g. name of a city ("Copenhagen")
* \`types\` defines set of [Place types] (https://developers.google.com/places/supported_types) that will be returned int the \`predictions\`

It can be to provide, among others, address autocompletion:
~~~jsx

import { useAddressPredictions } from "@/dfds-ui/hooks/src"

const AddressInput = () => {
  const [input, setInput] = useState("")
  const { predictions } = useAddressPredictions(input)

  return (
    <>
      <input value={input} onChange={e => setInput(e.target.value)}>
      <ul>
        {predictions.map((prediction, index) => (
          <li key={index}>{prediction}</li>
        ))}
      </ul>
    </>
  )
}
~~~~

`}
    </StoryPage>
  )
})
