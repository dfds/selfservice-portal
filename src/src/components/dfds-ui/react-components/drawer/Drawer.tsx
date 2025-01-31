import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import arrow, { ArrowPosition } from '../common/arrow'

type HorizontalPosition = 'left' | 'right'
type VerticalPosition = 'top' | 'bottom'
type Elevation = keyof typeof theme.elevation

export type DrawerProps = {
  /**
   * Horizontal position of the drawer
   */
  position?: HorizontalPosition

  /**
   * Show arrow to visually indicate the relation to a connected component
   */
  showArrow?: boolean
  /**
   *  Set the `elevation` for the Drawer.
   */
  elevation?: Elevation

  /**
   * Vertical position of the drawer in relation to a connected component.
   * Will only be used for placing the arrow on either the `top` or `bottom`
   */
  verticalPosition?: VerticalPosition

  /**
   * Class name to be assigned to the component
   */
  className?: string
  children?: React.ReactNode
}

const getArrowPlacement = (vertical: VerticalPosition, horizontal: HorizontalPosition): ArrowPosition => {
  return `${vertical ? vertical : 'top'}-${horizontal ? horizontal : 'left'}` as ArrowPosition
}

const drawerStyles = ({
  position,
  verticalPosition,
  showArrow,
  elevation,
}: {
  position: HorizontalPosition
  verticalPosition: VerticalPosition
  showArrow: boolean
  elevation: Elevation
}) => css`
  z-index: 1;
  position: absolute;
  height: auto;
  min-height: 50px;
  left: ${position === 'left' && 0};
  right: ${position === 'right' && 0};
  min-width: 112px;
  border-radius: 2px;
  box-shadow: ${theme.elevation[elevation]};
  background-color: ${theme.colors.surface.primary};
  display: grid;
  cursor: default;
  ${!showArrow ? '' : arrow(10, theme.colors.surface.primary, 20, getArrowPlacement(verticalPosition, position))}
`

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    { className, children, position = 'left', verticalPosition = 'bottom', showArrow = true, elevation = '4', ...rest },
    ref
  ) => {
    return (
      <div
        className={className}
        css={drawerStyles({ position, verticalPosition, showArrow, elevation })}
        ref={ref}
        {...rest}
      >
        <div>{children}</div>
      </div>
    )
  }
)

export default Drawer
