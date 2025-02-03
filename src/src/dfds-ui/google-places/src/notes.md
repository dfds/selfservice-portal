## Address Select

### Prequisite

In order for `AddressSelect` to work, it needs to be wrapped inside a
`GooglePlacesAPIProvider` as follows:

<!-- prettier-ignore -->
```jsx
import { GooglePlacesAPIProvider } from './google-places'

<GooglePlacesAPIProvider apiKey="GOOGLE_API_KEY">
  <AddressSelect name="city" />
</GooglePlacesAPIProvider>
```

Please see more information about `GooglePlacesAPIProvider` [here](/?path=/story/general-hooks--google-places-api-provider).

### Props

| Name          |  Values                      |  Description                                                              | Required |
| ------------- | ---------------------------- | ------------------------------------------------------------------------- | -------- |
| name          | string                       | Name of the input field.                                                  | X        |
| disabled      | boolean                      | Determines whether input is disabled.                                     |          |
| error         | string                       | Gives input an "error" state and displays error message under the input.  |          |
| assistiveText | string                       | Displays contextual information under the input.                          |          |
| placeholder   | string                       | Placeholder to display inside the input.                                  |          |
| size          | "small", "medium"            | Determines visual size of the input. Default value "medium".              |          |
| types         | string[]                     | Types array to be provided to the Google Places API autocomplete          |          |
| location      | {lat: number, lng: number}   | Latitude and longitude - results closer to the coords will appear first   |          |
| radius        | number                       | Radius in meters from location to include results from. Location required |          |
| onFocus       | (event: FocusEvent) => void; | Triggered when the internal input gets focused                            |          |
| onBlur        | (event: FocusEvent) => void; | Triggered when the internal input gets blurred                            |          |
| autoFocus     | boolean                      | Automatically get focus when the page loads                               |          |
| isClearable   | boolean                      | Determines whether the field can be cleared. Default - false              |          |
