import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import styled from '@emotion/styled'
import { rem } from '../styles/rem'

const menuStyles = css`
  background-color: ${theme.colors.surface.primary};
  padding: ${rem(15)} ${rem(20)};
`

const Menu = React.forwardRef(({ children, ...rest }, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div css={menuStyles} ref={ref} {...rest}>
      {children}
    </div>
  )
})

export type MenuItemProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  // React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode
  onClick: React.MouseEventHandler<HTMLDivElement>
}

const menuItemStyles = css`
  padding: 0.4rem 0 0.3rem 0;
  display: flex;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  align-items: center;
  color: ${theme.colors.secondary.main};
  &:hover {
    color: ${theme.colors.secondary.dark};
  }
`

const MenuItem: React.FC<MenuItemProps> = ({ children, onClick, ...rest }) => {
  return (
    <div css={menuItemStyles} onClick={onClick} {...rest}>
      {children}
    </div>
  )
}

const headerItemStyles = css`
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: ${rem(15)};
  color: ${theme.colors.text.dark.primary};
`

const HeaderItem = ({ children, ...rest }: { children?: React.ReactNode }) => {
  return (
    <div css={headerItemStyles} {...rest}>
      {children}
    </div>
  )
}

const SeparatorItem = styled.div`
  border-top: 1px solid ${theme.colors.primary.light};
  height: 0.1rem;
  margin: 0.5rem 0.5rem 0.5rem 0.5rem;
  opacity: 0.15;
`

const linkItemStyles = css`
  ${menuItemStyles}
  text-decoration: none;
  &:hover {
    background-color: ${theme.colors.secondary.light};
  }
`

// TODO: Add "as" prop for inject a ComponentOrElement for rendering the link
const LinkItem: React.FunctionComponent<{ url: string }> = ({ children, url, ...rest }) => {
  return (
    <a css={linkItemStyles} href={url} {...rest}>
      {children}
    </a>
  )
}

const CustomItem = ({ render }: { render: () => React.ReactNode }) => {
  return render()
}

// TODO: refactor to use separate exports
const menu = Menu as any
menu.Item = MenuItem
menu.Header = HeaderItem
menu.Link = LinkItem
menu.Custrom = CustomItem
menu.Separator = SeparatorItem

export default menu
