import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme, useBreakpoint, media } from '@/dfds-ui/theme/src'
import { FlexBox } from './../flexbox'
import { Logo as DfdsLogo } from './../logo'
import { Menu, Close } from '@/dfds-ui/icons/src/system'
import AppBarIconButton from './AppBarIconButton'
import { Divider } from '../divider'

import { useAppBarContext } from './'
import { useDimensions } from '@/dfds-ui/hooks/src'

type Breakpoint = 's' | 'm' | 'l'

const Logo = styled(DfdsLogo)`
  position: relative;
  padding: 0 0.5rem;
  width: auto;
  height: 2rem;

  ${theme.states.overlay(false, {
    color: theme.colors.primary.main,
  })};

  ${media.lessThan('m')`
    height: 1.625rem;
  `}
`

const toolbarSidePadding = 1 //rem
const Toolbar = styled(FlexBox)<{ isDrawerMode: boolean | null; menuBreakpoint: Breakpoint }>`
  padding: 0 ${toolbarSidePadding}rem;
  background-color: ${theme.colors.surface.primary};
  position: relative;
  height: 3.75rem;
  z-index: 1400;

  ${(p) =>
    media.lessThan(p.menuBreakpoint)`
      position: sticky;
      top: 0;
      height: 3rem;
    `}

  &[data-is-drawer-mode] {
    position: sticky;
    top: 0;
    height: 3rem;
  }
  ${media.lessThan('m')`
      padding: 0;
    `}
`

const Actions = styled(FlexBox)<{ isDrawerMode?: boolean | null; menuBreakpoint: Breakpoint }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;

  ${(p) =>
    media.lessThan(p.menuBreakpoint)`
      visibility: hidden;
      overflow: hidden;
    `}

  [data-is-drawer-mode] & {
    visibility: hidden;
    overflow: hidden;
  }
`

const ToolActions = styled(FlexBox)`
  height: 100%;
  margin-left: auto;
  z-index: 1;
`

const MenuIconButton: React.FC<{ onClick?: () => void }> = ({ onClick, ...props }) => {
  const { drawerOpen, setDrawerOpen } = useAppBarContext()

  return (
    <AppBarIconButton
      icon={!drawerOpen ? Menu : Close}
      showTooltip={false}
      ariaLabel="menu"
      onClick={(e: React.MouseEvent) => {
        e.preventDefault()
        setDrawerOpen(!drawerOpen)
        if (onClick) {
          onClick()
        }
      }}
      {...props}
    />
  )
}

const AppBar: React.FC<{
  leftActions?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  logoProps?: any
  menuBreakpoint?: Breakpoint
  hasMenuButton?: boolean
  handleMenuButtonClick?: () => void
  children?: React.ReactNode
}> = ({
  children,
  leftActions,
  actions,
  logoProps,
  menuBreakpoint = 'm',
  handleMenuButtonClick,
  hasMenuButton = true,
  ...rest
}) => {
  const { setHeight } = useAppBarContext()
  const { lessThan } = useBreakpoint()
  const [ref, { width, height }] = useDimensions()
  const [centerRef, { width: centerWidth = 0 }] = useDimensions()
  const [leftRef, { width: leftWidth = 0 }] = useDimensions()
  const [rightRef, { width: rightWidth = 0 }] = useDimensions()
  const [largestSideWidth, setLargestSideWidth] = useState<number>(leftWidth > rightWidth ? leftWidth : rightWidth)
  const [largestCenterWidth, setLargestCenterWidth] = useState<number>(centerWidth)

  useEffect(() => {
    setLargestSideWidth((l) => Math.max(l, leftWidth, rightWidth))
    setLargestCenterWidth((l) => Math.max(l, centerWidth))
  }, [leftWidth, rightWidth, centerWidth])

  useEffect(() => {
    setHeight(height)
  }, [height])

  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const hasEnoughSpace = (width - largestCenterWidth) / 2 > largestSideWidth + toolbarSidePadding * 16
  const isDrawerMode = typeof window === 'undefined' ? false : !hasEnoughSpace || lessThan(menuBreakpoint)

  return (
    <header>
      <Toolbar
        ref={ref}
        as="nav"
        itemsCenter
        isDrawerMode={isDrawerMode}
        menuBreakpoint={menuBreakpoint}
        data-is-drawer-mode={isDrawerMode || undefined}
        data-has-menu-button={hasMenuButton || undefined}
        {...rest}
      >
        <FlexBox
          ref={leftRef}
          css={css`
            margin-right: auto;
            z-index: 1;
            height: 100%;
          `}
        >
          {
            <MenuIconButton
              css={css`
                display: none;
                ${media.lessThan(menuBreakpoint)`
                  display: block;
                `}
                [data-is-drawer-mode][data-has-menu-button] & {
                  display: block;
                }
              `}
            />
          }
          <Logo width={84} {...logoProps} />
          <FlexBox
            css={css`
              height: 100%;
              ${media.lessThan(menuBreakpoint)`
                display: none;
              `}
              [data-is-drawer-mode] & {
                display: none;
              }
            `}
          >
            {leftActions}
          </FlexBox>
        </FlexBox>
        <Actions isDrawerMode={isDrawerMode} menuBreakpoint={menuBreakpoint} flex={1} justifyCenter contentCenter>
          <FlexBox ref={centerRef}>{children}</FlexBox>
        </Actions>
        <ToolActions ref={rightRef}>{actions}</ToolActions>
      </Toolbar>
      <Divider />
    </header>
  )
}

export default AppBar
