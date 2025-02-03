import React from 'react'
import { action } from '@storybook/addon-actions'
import AddressSelectComponent from './AddressSelect'
import { GooglePlacesAPIProvider } from './GooglePlaces'

export default {
  title: 'General/Packages/Google Places',
  argTypes: {
    types: {
      defaultValue: 'Dark text',
      options: ['(cities)', '(regions)', 'address'],
      control: { type: 'select' },
    },
    countries: {
      defaultValue: 'se',
      options: ['se', 'dk', 'no', 'fi', 'gb'],
      control: { type: 'select' },
    },
    isClearable: {
      defaultValue: true,
      control: { type: 'boolean' },
    },
    error: {
      defaultValue: 'Error',
      control: { type: 'text' },
    },
    assistiveText: {
      defaultValue: 'Assisitve Text',
      control: { type: 'text' },
    },
    placeHolder: {
      defaultValue: 'Placeholder',
      control: { type: 'text' },
    },
    location: {
      defaultValue: false,
      control: { type: 'boolean' },
    },
    radius: {
      defaultValue: 20035.5,
      control: { type: 'number' },
    },
  },
}

export const AddressSelect = ({
  types,
  countries,
  isClearable,
  error,
  assistiveText,
  placeHolder,
  location,
  radius,
}: {
  types: any
  countries: any
  isClearable: boolean
  error: string
  assistiveText: string
  placeHolder: string
  location: boolean
  radius: number
}) => (
  <GooglePlacesAPIProvider apiKey={process.env.STORYBOOK_GOOGLE_API_KEY || ''}>
    <AddressSelectComponent
      name="city"
      types={types}
      countries={countries}
      onFocus={action('focused')}
      onBlur={action('blurred')}
      onChange={action('value changed')}
      isClearable={isClearable}
      error={error}
      assistiveText={assistiveText}
      placeholder={placeHolder}
      location={
        location
          ? {
              lat: 90,
              lng: 180,
            }
          : undefined
      }
      radius={location ? radius : undefined}
    />
  </GooglePlacesAPIProvider>
)
