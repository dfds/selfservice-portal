import React, { ReactElement } from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import { Drawer } from '../drawer'
import { DropdownContextProvider } from './DropdownContext'
import { Popper, PopperProps, PopperPlacementType } from '@mui/material'
import { ClickAwayListener } from '@mui/base'

export type DropdownSize = 'medium' | 'small'

export type DropdownProps = {
  /**
   * Placement for the `Dropdown`.
   */
  placement?: PopperPlacementType
  /**
   * HTML element that the `Dropdown` will be anchor to.
   */
  anchorEl?: PopperProps['anchorEl']
  /**
   * If set to `true`, the `Dropdown` is shown.
   */
  isOpen: boolean
  /**
   * Set the state of the `Dropdown`.
   */
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  /**
   * Specify the size of the `Dropdown`.
   */
  size?: DropdownSize
  /**
   * Close the `Dropdown` on `esc` key.
   */
  shouldCloseOnEsc?: boolean
  /**
   * className to be assigned to component.
   */
  className?: string
  /**
   * Select multiple children from the `Dropdown`.
   */
  multiselect?: boolean
  /**
   * Add an `id` to the `Dropdown`.
   */
  id?: string
  onClickAway?: () => void
  children: ReactElement[]
  filter?: boolean
}

const getDrawerStyles = (size?: DropdownSize) => css`
  box-shadow: ${theme.elevation['4']};
  padding: ${theme.spacing.xxs} 0;
  max-height: 418px;
  min-width: ${size === 'small' ? '124px' : '157px'};
  max-width: 288px;
  width: max-content;
`

const ScrollableDiv = React.forwardRef((props: any, ref: any) => {
  return (
    <div
      tabIndex={0}
      css={css`
        max-height: 410px;
        overflow: auto;
      `}
      {...props}
      ref={ref}
    />
  )
})

const DropdownMenu = ({
  isOpen = false,
  multiselect,
  children,
  anchorEl,
  onClickAway,
  size = 'medium',
  id,
  className,
  placement,
  setIsOpen,
  shouldCloseOnEsc,
  filter,
  ...rest
}: DropdownProps) => {
  const [filtered, setFiltered] = React.useState<string>('')
  const containerRef = React.useRef<HTMLDivElement>()
  const firstChildRef = React.useRef<any>()
  const currentFocus = React.useRef<any>()
  const setContainerRef = React.useCallback((node: HTMLDivElement) => {
    if (node) {
      containerRef.current = node
      firstChildRef.current = containerRef.current?.firstChild
      currentFocus.current = firstChildRef.current
      currentFocus.current.focus()
    } else {
      containerRef.current = undefined
    }
  }, [])

  const handleCharDown = (event: React.KeyboardEvent<Element>) => {
    event.stopPropagation()
    const eventKey = event.key

    if (['ArrowUp', 'ArrowDown'].includes(eventKey)) {
      return handleArrowsUpDown(event)
    }

    if (!filter) return

    const rgx = /[a-zA-Z0-9]/g
    const test = rgx.test(eventKey)
    if (test && eventKey.length === 1) {
      setFiltered((prevState) => prevState + eventKey.toUpperCase())
    }
  }

  const handleArrowsUpDown = (event: React.KeyboardEvent<Element>) => {
    if (event.key === 'ArrowUp') {
      const prev = currentFocus.current.previousSibling
      if (prev) {
        event.preventDefault()
        currentFocus.current = prev
        prev.focus()
      }
    } else if (event.key === 'ArrowDown') {
      const next = currentFocus.current.nextSibling
      if (next) {
        event.preventDefault()
        currentFocus.current = next
        next.focus()
      }
    } else if (event.key === 'Escape' && shouldCloseOnEsc) {
      if (isOpen) {
        setIsOpen(false)
      }
    }
  }

  const filterChildren = (param: typeof children) => {
    if (filtered.length >= 1) {
      return param.filter((x) => x.props.children.toUpperCase().includes(filtered))
    }
    return param
  }

  React.useEffect(() => {
    if (!isOpen) {
      setFiltered('')
    }
  }, [isOpen])

  return (
    <Popper
      open={isOpen}
      anchorEl={anchorEl}
      id={id}
      placement={placement}
      css={css`
        z-index: ${theme.zIndex.modal};
      `}
      {...rest}
    >
      <ClickAwayListener
        onClickAway={() => {
          onClickAway && onClickAway()
        }}
      >
        <Drawer css={getDrawerStyles(size)} showArrow={false} className={className} {...rest}>
          <DropdownContextProvider value={{ size, multiselect }}>
            <ScrollableDiv ref={setContainerRef} onKeyDown={handleCharDown}>
              {filter ? filterChildren(children) : children}
            </ScrollableDiv>
          </DropdownContextProvider>
        </Drawer>
      </ClickAwayListener>
    </Popper>
  )
}

export default DropdownMenu
