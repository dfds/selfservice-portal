import React, { useState } from 'react'
import { AsyncSearchableSelect } from '@/dfds-ui/react-components/src'
import debounce from 'lodash.debounce'
import { useAddressPredictions, ILocation, IPrediction } from './GooglePlaces'

export type AddressSelectProps = {
  components?: any
  name: string
  disabled?: boolean
  error?: string
  size?: 'small' | 'medium'
  types?: string[]
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onChange?: (changed: { value: string; label: string }, predictions: IPrediction[]) => void
  location?: ILocation
  radius?: number
  countries?: string[] | string
  placeholder?: string
  assistiveText?: string
  autoFocus?: boolean
  isClearable?: boolean
  /**
   * Class name to be assigned to the component
   */
  className?: string
}

const AddressSelect = ({
  name,
  disabled,
  error,
  size = 'medium',
  types,
  onFocus,
  onBlur,
  onChange,
  location,
  radius,
  countries = [],
  ...rest
}: AddressSelectProps) => {
  const [predictions, setPredictions] = useState<IPrediction[]>([])
  const { available, getPlacePredictions } = useAddressPredictions('', {
    types,
    location,
    radius,
    components: {
      countries,
    },
  })

  const loadOptions = async (input: string, callback: any) => {
    const placePredictions: IPrediction[] = await getPlacePredictions(input)
    setPredictions(placePredictions)
    const options = placePredictions.map((prediction) => ({
      value: prediction.description,
      label: prediction.description,
      prediction
    }))
    callback(options)
  }

  const handleChange = (value: any) => {
    if (onChange) {
      onChange(value, predictions)
    }
  }

  return (
    <AsyncSearchableSelect
      disabled={disabled || !available}
      name={name}
      error={error}
      size={size}
      onChange={handleChange}
      loadOptions={debounce(loadOptions, 500)}
      onFocus={onFocus}
      onBlur={onBlur}
      {...rest}
    />
  )
}

export default AddressSelect
