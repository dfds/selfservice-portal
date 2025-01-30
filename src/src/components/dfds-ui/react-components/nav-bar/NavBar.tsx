import React, { useState } from 'react'
import styled from '@emotion/styled'
import Logo from '../logo/Logo'
import { css } from '@emotion/react'
import { legacyMedia as media } from '../styles/media'
import { rem } from '../styles/rem'
import useOnClickOutside from '../common/useOnClickOutside'
import arrow from '../common/arrow'
import { theme } from '@dfds-ui/theme'

type ItemAlignment = 'left' | 'right'

type NavBarProps = {
  className?: string
  showLogo?: boolean
  href?: string
}

type ItemProps = {
  href?: string
  className?: string
  alignment?: ItemAlignment
  selected?: boolean
  as?: React.ElementType // can be used to render a different component for the anchor (eg. next/gatsby link)
}

const DFDSLogo = styled(Logo)`
  height: ${rem(32)};
  width: ${rem(112)};
  margin-right: ${rem(20)};
`

const NavBarContainer = styled.div`
  background-color: ${theme.colors.surface.primary};
  display: flex;
  align-items: center;
  min-height: ${rem(60)};
  padding: 0 5px;
  /* IE flexbox min-height fix */
  :after {
    content: '';
    min-height: inherit;
    font-size: 0;
  }
`

// TODO: Refactor and remove href. Consider adding an "as" prop to change the wrapper of the logo component
const NavBar: React.FunctionComponent<NavBarProps> = ({ href, className, showLogo, children, ...rest }) => {
  return (
    <NavBarContainer className={className} data-testid="NavBar" {...rest}>
      {showLogo && (
        <a href={href} data-testid="LogoLink">
          <DFDSLogo />
        </a>
      )}
      {children}
    </NavBarContainer>
  )
}

NavBar.defaultProps = {
  showLogo: true,
  href: '/',
}

const baseItemStyles = css`
  display: flex;
  position: relative;
  align-self: stretch;
  align-items: center;
  text-decoration: none;
  padding: 0 1.5rem;
  color: ${theme.colors.text.dark.primary};
`

const ItemAnchor = styled.a<{
  alignment?: ItemAlignment
  selected?: boolean
  as?: React.ElementType
}>`
  ${baseItemStyles}
  color: ${theme.colors.primary.main};
  background-color: ${(p) => (p.selected ? theme.colors.secondary.light : 'transparent')};
  border-left: 1px solid ${theme.colors.secondary.light};
  font-size: 1rem;
  font-weight: normal;

  :hover {
    background-color: #f3f9fd;
    text-decoration: none;
  }

  transform: skewX(-30deg);
  span {
    transform: skewX(30deg);
  }

  ${media.lt('md')} {
    display: none;
  }
`

// TODO: consider using forwardRef
export const NavBarItem: React.FunctionComponent<ItemProps> = ({
  children,
  className,
  href,
  as: renderAs,
  ...rest
}) => {
  return (
    <ItemAnchor as={renderAs} href={href} className={className} {...rest}>
      <span>{children}</span>
    </ItemAnchor>
  )
}

const pushRight = css`
  margin-left: auto;
  & ~ & {
    margin-left: 0;
  }
`
type NavBarIconProps = React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & //  React.AnchorHTMLAttributes<HTMLAnchorElement> &
  ItemProps & {
    menu?: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLAnchorElement>
    closeMenuOnClick?: boolean
  }

export const NavBarIconAnchor = styled.a<{ menuShown: boolean; className?: string }>`
  ${baseItemStyles}
  color: ${theme.colors.secondary.main};
  font-size: 1.5rem;

  :hover {
    color: ${theme.colors.secondary.dark};
    background-color: #f3f9fd;
    text-decoration: none;
  }

  background-color: ${(p) => p.menuShown && '#f3f9fd'};
`

const NavBarIconWrapper = styled.div<{ alignment?: ItemAlignment }>`
  display: flex;
  position: relative;
  align-self: stretch;
  align-items: center;
  ${(p) => p.alignment === 'right' && pushRight}
`

export const NavBarIcon: React.FunctionComponent<NavBarIconProps> = ({
  children,
  alignment,
  menu,
  onClick,
  closeMenuOnClick = true,
  ...rest
}) => {
  const [menuShown, setMenuShown] = useState(false)
  const hasMenu = !!menu

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasMenu) {
      setMenuShown(!menuShown)
      e.preventDefault()
    } else {
      if (onClick) {
        onClick(e)
      }
    }
  }

  const ref = React.useRef(null)
  useOnClickOutside(ref, () => setMenuShown(false))

  return (
    <NavBarIconWrapper ref={ref} alignment={alignment}>
      <NavBarIconAnchor menuShown={menuShown} onClick={handleClick} {...rest}>
        {children}
      </NavBarIconAnchor>
      {hasMenu && menuShown && (
        <NavBarDropdown onClick={() => closeMenuOnClick && setMenuShown(false)}>
          <div>{menu}</div>
        </NavBarDropdown>
      )}
    </NavBarIconWrapper>
  )
}

export const NavBarDropdown = styled.div`
  z-index: 1;
  position: absolute;
  height: auto;
  top: 100%;
  right: 0;
  width: auto;
  border-radius: 2px;
  border: 1px solid ${theme.colors.text.dark.disabled};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
  background-color: ${theme.colors.surface.primary};
  cursor: default;
  ${arrow(10, theme.colors.surface.primary, 28, 'bottom-right')}
`

export default NavBar
