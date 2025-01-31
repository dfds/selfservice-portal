import { css } from '@emotion/react'
import React, { ComponentPropsWithRef, forwardRef } from 'react'
import * as systemIcons from './system'

type SystemIcon = keyof typeof systemIcons

type Size = 's' | 'm' | 'l' | 'xl'

export type SystemIconProps = {
  /**
   * Name of the icon in the System set of icons.
   */
  icon: SystemIcon

  /**
   * Predefined size to use.
   */
  size?: Size

  /**
   * Class name to be assigned to the component.
   */
  className?: string

  /**
   * Setting the `inline` prop to `true` will set negative margins which will compensate for the existing padding/space
   * that appears inside the icon's sources. Use this only when inline icons inside a text-block.
   *
   * NB! Using `inline` will result in the `size` prop being ignored.
   */
  inline?: boolean
} & ComponentPropsWithRef<'svg'>

const sizes: { [k in Size]: string } = {
  s: '1rem',
  m: '1.5rem',
  l: '2rem',
  xl: '2.5rem',
}

const inlineCss = (size: string) => css`
  display: inline;
  margin-top: calc(-${size} / 6);
  margin-bottom: calc(-${size} / 6);
`
/**
 * The `SystemIcon` component is a helper component for displaying icons in the **system** set in "sane" sizes.
 */
export const SystemIcon = forwardRef<SVGSVGElement, SystemIconProps>(
  ({ icon, size = 'm', className, inline, ...rest }, ref) => {
    const Icon = systemIcons[icon]
    const sizeValue = inline ? '1.5em' : sizes[size]
    return (
      <Icon
        className={className}
        height={sizeValue}
        width={sizeValue}
        css={inline && inlineCss(sizeValue)}
        {...rest}
        ref={ref}
      />
    )
  }
)
