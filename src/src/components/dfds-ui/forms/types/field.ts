import { ReactNode } from 'react'

/**
 * Generic FieldProps
 */
export type BaseFieldProps = {
  /**
   * Assistive text describing the field.
   *
   * NB! If space is needed for alignment you can use a space char (' ') here.
   */
  assistiveText?: string
  /**
   * Indicates that the field is disabled.
   */
  disabled?: boolean
  /**
   * Sets an error message (if assistive text applies it will be replaced by this).
   */
  errorMessage?: string
  /**
   * Additional help.
   *
   * **This is an experimental prop and the behavior might change.**
   */
  // TODO: Change to React.ReactNode when no longer using the tooltip to show help
  help?: string
  /**
   * Controls the placement of the help icon.
   *
   * **This is an experimental prop and the behavior might change.**
   */
  helpPlacement?: 'top' | 'right'
  /**
   * If set to `true` the asterisk will never be shown.
   */
  hideAsterisk?: boolean
  /**
   * Field label.
   */
  label?: ReactNode
  /**
   * Field name.
   */
  name: string
  /**
   * Hint for the field. For Input elements this maps to the `placeholder` attribute.
   */
  placeholder?: string
  /**
   * Indicates if the field is required. Will add an asterisk to the label unless `hideAsterisk` is set to `true`.
   */
  required?: boolean
}
