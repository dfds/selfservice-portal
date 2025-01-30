import React from 'react'
import { Popper as MaterialPopper, PopperProps, PopperPlacementType } from '@mui/material'
import { ClickAwayListener } from '@mui/base'
import { theme } from '@dfds-ui/theme'
import { css } from '@emotion/react'

export type PopperBaseProps = {
  open?: boolean
  // TODO: Consider changing the type to React.ReactNode
  children: React.ReactElement | string
  anchorEl?: any
  id?: string
  placement?: PopperPlacementType
  disablePortal?: PopperProps['disablePortal']
  /**
   * By default the max-width will be set to 100%. This will allow for child elements to have a width of 100vw and also
   * a max-width of 100% so it will not be overflowing the potential vertical scrollbars.
   *
   * You can disable this by setting `noMaxWidthRestriction` to `false`
   */
  noMaxWidthRestriction?: boolean
  role?: string
  onClickAway?: (e: any) => void
  className?: string
  style?: PopperProps['style']
  popperRef?: PopperProps['popperRef']
  modifiers?: PopperProps['modifiers']
}

export const PopperBase = ({
  open = false,
  children,
  anchorEl,
  id,
  placement,
  onClickAway,
  className,
  noMaxWidthRestriction = false,
  ...rest
}: PopperBaseProps) => {
  return (
    <MaterialPopper
      placement={placement}
      id={id}
      open={open}
      className={className}
      anchorEl={anchorEl}
      css={
        !noMaxWidthRestriction &&
        css`
          max-width: 100%;
        `
      }
      {...rest}
    >
      <ClickAwayListener
        onClickAway={(e) => {
          onClickAway && onClickAway(e)
        }}
      >
        <div>{children}</div>
      </ClickAwayListener>
    </MaterialPopper>
  )
}

type PopperComponentProps = {
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>
} & Omit<PopperBaseProps, 'onClickAway'>

const Popper = ({ children, anchorEl, id, setAnchorEl, placement, popperRef, ...rest }: PopperComponentProps) => {
  const open = Boolean(anchorEl)

  return (
    <PopperBase
      placement={placement}
      id={id}
      open={open}
      anchorEl={anchorEl}
      {...rest}
      onClickAway={() => setAnchorEl(null)}
      css={css`
        background: ${theme.colors.surface.primary};
        box-shadow: ${theme.elevation[16]};
        padding: ${theme.spacing.m};
      `}
    >
      {children}
    </PopperBase>
  )
}

export default Popper
