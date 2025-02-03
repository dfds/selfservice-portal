import React, { ElementType, ComponentPropsWithRef, forwardRef } from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import { OverlayOptions } from '@/dfds-ui/theme/src/states'
import { PolymorphicComponentProps } from '../common/polymorphic'
import { UnstableWithTooltip } from '../tooltip/Tooltip'

export type IconButtonSize = 'small' | 'medium' | 'large' | 's' | 'm' | 'l'

export interface IconButtonProps extends PolymorphicComponentProps, ComponentPropsWithRef<'button'> {
  /**
   * Icon to be displayed on the button.
   */
  icon: ElementType
  /**
   * Text of the aria-label as well as the fallback value used for tooltip.
   */
  ariaLabel: string
  /**
   * Size of the button.
   */
  size?: IconButtonSize
  /**
   * className to be assigned to the button.
   */
  className?: string
  /**
   * Disable button.
   */
  disabled?: boolean
  /**
   * Disable overlay states.
   */
  disableOverlay?: boolean
  /**
   * Disable tooltip.
   */
  disableTooltip?: boolean
  /**
   * Text of the tooltip, if none, aria-label will be used.
   */
  tooltip?: string
  /**
   * Color of the button and the overlay state.
   */
  color?: string
  /**
   * Override color to be used for the hover state.
   */
  hoverColor?: string
  /**
   * Override color to be used for the active state.
   */
  activeColor?: string
  /**
   * Override color to be used for the focus state.
   */
  focusColor?: string
  /**
   * Override the overlay options to use.
   */
  overlayOptions?: OverlayOptions
}

/**
 * Helper function returning the default icon size when rendering an IconButton in the specified size.
 * @param size : IconButtonSize;
 * @returns The default icon size
 */
export const getDefaultIconButtonIconSize = (size: IconButtonSize) => {
  switch (size) {
    case 'small':
    case 's':
      return '1.25rem'
    case 'medium':
    case 'm':
      return '1.5rem'
    case 'large':
    case 'l':
      return '2rem'
  }
}

/**
 * Helper function returning the default dimensions of an IconButton in the specified size.
 * @param size : IconButtonSize;
 * @returns The default size
 */
export const getDefaultIconButtonDimensions = (size: IconButtonSize) => {
  switch (size) {
    case 'small':
    case 's':
      return { height: '2.5rem', width: '2.5rem' }
    case 'medium':
    case 'm':
      return { height: '2.75rem', width: '2.75rem' }
    case 'large':
    case 'l':
      return { height: '2.75rem', width: '2.75rem' }
  }
}

const getDisabledTextColor = (color: string) => {
  const themeColorsText = theme.colors.text

  switch (color) {
    case themeColorsText.dark.primary:
      return themeColorsText.dark.disabled
    case themeColorsText.dark.secondary:
      return themeColorsText.dark.disabled
    case themeColorsText.light.primary:
      return themeColorsText.light.disabled
    case themeColorsText.light.secondary:
      return themeColorsText.light.disabled
    case themeColorsText.primary.primary:
      return themeColorsText.primary.disabled
    case themeColorsText.primary.secondary:
      return themeColorsText.primary.disabled
    case themeColorsText.secondary.primary:
      return themeColorsText.secondary.disabled
    case themeColorsText.secondary.disabled:
      return themeColorsText.secondary.disabled
    default:
      return color
  }
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      type,
      tooltip,
      title,
      size = 'medium',
      icon: Icon,
      disableTooltip = false,
      disableOverlay = false,
      disabled = false,
      color,
      hoverColor,
      focusColor,
      activeColor,
      overlayOptions = theme.states.overlayOptions.defaultOverlayOptions,
      as = 'button',
      ariaLabel,
      ...rest
    },
    ref
  ) => {
    const Component = as
    const defaultDimensions = getDefaultIconButtonDimensions(size)

    const iconButton = (
      <Component
        aria-label={ariaLabel}
        disabled={disabled}
        type={type}
        css={css`
          display: inline-flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          position: relative;
          margin: 0;
          border: 0;
          cursor: pointer;
          user-select: none;
          outline: none;
          position: relative;
          background-color: transparent;

          min-width: ${defaultDimensions.width};
          min-height: ${defaultDimensions.height};
          font-size: ${getDefaultIconButtonIconSize(size)};

          color: ${color ? color : theme.colors.text.primary.secondary};

          &:hover {
            color: ${hoverColor ? hoverColor : color ? color : theme.colors.secondary.main};
          }

          &:focus {
            color: ${focusColor ? focusColor : color ? color : theme.colors.secondary.main};
          }

          &:active,
          &:disabled {
            color: ${activeColor ? activeColor : color ? color : theme.colors.secondary.main};
          }

          &[disabled] {
            color: ${color ? getDisabledTextColor(color) : theme.colors.text.dark.disabled};
            cursor: not-allowed;
          }

          ${!disableOverlay && theme.states.overlay(false, overlayOptions)};
        `}
        {...rest}
        ref={ref}
      >
        <Icon size={size} focusable={false} />
      </Component>
    )

    if (disableTooltip || disabled) {
      return iconButton
    }

    return (
      <UnstableWithTooltip
        css={css`
          margin: 0;
        `}
        content={tooltip || title || ariaLabel}
        delay={[500, 200]}
      >
        {iconButton}
      </UnstableWithTooltip>
    )
  }
)

export default IconButton
