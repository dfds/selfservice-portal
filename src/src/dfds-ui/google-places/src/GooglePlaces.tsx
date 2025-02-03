/// <reference types="@types/googlemaps" />
import React, { createContext, useState, useContext, useRef, useEffect } from 'react'
import { useScript } from '@/dfds-ui/hooks/src'

export const GooglePlacesAPIContext = createContext({
  available: false,
})

export interface ILocation {
  lat: number
  lng: number
}

interface IPredictionsOptions {
  types?: string[] | undefined
  location?: ILocation | undefined
  radius?: number | undefined
  components: {
    countries: string | string[] | undefined
  }
}

interface IPredictionSubstring {
  length: number
  offset: number
}

interface IAutocompleteStructuredFormatting {
  main_text: string
  main_text_matched_substrings: IPredictionSubstring[]
  secondary_text: string
}

interface IPredictionTerm {
  offset: number
  value: string
}

export interface IPrediction {
  description: string
  matched_substrings: IPredictionSubstring[]
  place_id: string
  reference: string
  structured_formatting: IAutocompleteStructuredFormatting
  terms: IPredictionTerm[]
  types: string[]
}

export interface IGooglePlacesAPIProviderProps {
  children: React.ReactNode
  apiKey: string
  language?: string
  libraries?: string
}

export const GooglePlacesAPIProvider = ({
  children,
  apiKey,
  language,
  libraries = 'places',
}: IGooglePlacesAPIProviderProps) => {
  // On SSR window does not exist.
  const hasWindow = typeof window !== 'undefined'

  // We want to prevent the google maps api to be loaded more than once
  const isGoogleMapsDefined = hasWindow && Boolean(window?.google?.maps)

  const languageParam = language ? `&language=${language}` : ''
  // NOTE: Google Maps API requires a callback when ran asynchronously. See https://developers.google.com/maps/documentation/javascript/url-params#required_parameters
  // Dummy callback to satisfy Google Maps API.
  const dummyCallback = () => {
    return
  }
  // @ts-expect-error dummyCallback does not exist on window. A callback is required by Google Maps API.
  if (hasWindow) window.dummyCallback = dummyCallback
  const callback = hasWindow ? `&callback=dummyCallback` : ''
  const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries}${languageParam}${callback}`

  const [loaded, error] = useScript(scriptUrl, isGoogleMapsDefined)
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    setAvailable(loaded && !error)

    if (error) {
      throw new Error('Google Places API script failed to load')
    }
  }, [loaded, error])

  return (
    <GooglePlacesAPIContext.Provider
      value={{
        available,
      }}
    >
      {children}
    </GooglePlacesAPIContext.Provider>
  )
}

export const useGooglePlacesAPI = () => {
  const context = useContext(GooglePlacesAPIContext)
  if (context === undefined) {
    throw new Error('useGooglePlaces must be used inside of GooglePlacesAPIProvider')
  }

  return context
}

export const useAddressPredictions = (
  input: string,
  { types, location, radius, components }: IPredictionsOptions
): {
  available: boolean
  predictions: IPrediction[]
  getPlacePredictions: (input: string) => Promise<IPrediction[]>
} => {
  const [predictions, setPredictions] = useState([])
  const { available } = useGooglePlacesAPI()

  const autocomplete = useRef<any>()

  if (!autocomplete.current && available && typeof window !== 'undefined') {
    autocomplete.current = new google.maps.places.AutocompleteService()
  }

  function getPlacePredictions(input: string): Promise<IPrediction[]> {
    return new Promise((resolve) => {
      autocomplete.current.getPlacePredictions(
        {
          input,
          types,
          radius,
          location:
            location !== undefined
              ? {
                  lat: () => (location !== undefined ? location.lat : undefined),
                  lng: () => (location !== undefined ? location.lng : undefined),
                }
              : undefined,
          componentRestrictions: {
            country: components.countries,
          },
        },
        (predictions: any) => {
          predictions = predictions ?? []
          setPredictions(predictions)
          resolve(predictions)
        }
      )
    })
  }

  useEffect(() => {
    if (input !== '') {
      void getPlacePredictions(input)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  return { available, predictions, getPlacePredictions }
}
