import React, { forwardRef } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import { Popper } from '@mui/material'
import { Text } from '@/components/dfds-ui/typography'
import { ClickAwayListener } from '@mui/base'
import { ChevronDown } from '@/components/dfds-ui/icons/system'
import { PopperProps } from '@mui/material'

export type AppBarItemProps = {
  id: string
  Icon?: React.ElementType
  LeadingIcon?: React.ElementType
  TrailingIcon?: React.ElementType
  title: string
  divider?: 'start' | 'end' | 'both'
  children?: React.ReactNode
  as?: React.ElementType
  onClick?: () => void
  placement?: 'bottom-start' | 'bottom-end'
  isActive?: boolean
  AppBarPopperProps?: Omit<PopperProps, 'open'>
}

function menuCategoryStyles({ isActive }: { isActive?: boolean }) {
  return css`
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: 0 0.75rem;
    color: ${theme.colors.primary.main};
    text-decoration: none;
    position: relative;
    ${isActive &&
    css`
      color: ${theme.colors.secondary.main};
    `}

    ${theme.states.overlay(isActive, {
      color: theme.colors.text.secondary.primary,
    })};
  `
}

type MenuItemBlockProps = {
  divider?: 'start' | 'end' | 'both'
  children?: React.ReactNode
}

const MenuItemBlock = forwardRef<HTMLDivElement, MenuItemBlockProps>(({ divider, children }, ref) => {
  return (
    <div
      css={css`
        position: relative;
        box-sizing: border-box;
        display: block;
        height: 100%;

        &::before,
        &::after {
          display: none;
          content: '';
          height: 1.5rem;
          width: 1px;
          background: ${theme.colors.primary.main};
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        ${divider &&
        ['end', 'both'].includes(divider) &&
        css`
          &::after {
            display: block;
            right: 0;
          }
        `}

        ${divider &&
        ['start', 'both'].includes(divider) &&
        css`
          &::before {
            display: block;
            left: 0;
          }
        `}
      `}
      ref={ref}
    >
      {children}
    </div>
  )
})

export const MenuPopOverContext = React.createContext<{ handlePopoverClose: () => void } | undefined>(undefined)

export const AppBarPopper = styled(Popper)`
  border-radius: ${theme.radii.m};
  background-color: ${theme.colors.surface.primary};
  box-shadow: ${theme.elevation[4]};
  width: max-content;
  min-width: 8rem;
  max-width: 25rem;
`

export const AppBarItem: React.FC<AppBarItemProps & JSX.IntrinsicElements['a']> = ({
  id,
  Icon,
  LeadingIcon,
  TrailingIcon,
  title,
  divider,
  children,
  onClick,
  placement = 'bottom-start',
  isActive,
  as = 'div',
  AppBarPopperProps = {},
  ...rest
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const handlePopoverOpen = (event: any) => {
    setAnchorEl(event.currentTarget)
    if (onClick) {
      onClick()
    }
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl)
  const MenuCategory = as

  return (
    <MenuPopOverContext.Provider value={{ handlePopoverClose }}>
      <ClickAwayListener onClickAway={handlePopoverClose}>
        <MenuItemBlock divider={divider}>
          <MenuCategory
            css={menuCategoryStyles({ isActive })}
            aria-owns={open ? id : undefined}
            aria-haspopup="true"
            {...rest}
            {...(children && { onClick: !open ? handlePopoverOpen : handlePopoverClose })}
          >
            {Icon ? (
              <Icon
                css={css`
                  font-size: 1.5rem;
                `}
                aria-label={title}
              />
            ) : (
              <>
                {LeadingIcon && (
                  <LeadingIcon
                    css={css`
                      margin-right: 0.25rem;
                    `}
                  />
                )}
                <Text
                  styledAs="actionBold"
                  as="span"
                  css={css`
                    font-size: 16px;
                  `}
                >
                  {title}
                </Text>
                {TrailingIcon ? (
                  <TrailingIcon
                    css={css`
                      margin-left: 0.25rem;
                    `}
                  />
                ) : (
                  children && (
                    <ChevronDown
                      css={css`
                        margin-left: 0.25rem;
                      `}
                    />
                  )
                )}
              </>
            )}
          </MenuCategory>
          {children && (
            <AppBarPopper
              open={open}
              id={id}
              anchorEl={anchorEl}
              placement={placement}
              disablePortal
              {...AppBarPopperProps}
            >
              {children}
            </AppBarPopper>
          )}
        </MenuItemBlock>
      </ClickAwayListener>
    </MenuPopOverContext.Provider>
  )
}
