import React from 'react'
import { storiesOf } from '@storybook/react'
import NavBar, { NavBarItem, NavBarIcon } from './NavBar'
import Menu from '../menu/Menu'
import styled from '@emotion/styled'
import { FlagInt } from '@dfds-ui/icons/flags'
import { Account, Menu as BurgerMenu } from '@dfds-ui/icons/system'

const stories = storiesOf('UI/NavBar', module)

const AccountIcon = styled(Account)`
  font-size: 1.5rem;
`

stories.add('NavBar', () => (
  <>
    <NavBar href="/">
      <NavBarItem href="#">DFDS Platform</NavBarItem>
      <NavBarItem>Rest of DFDS</NavBarItem>
      <NavBarIcon href="#" alignment="right" title="Language">
        <FlagInt />
      </NavBarIcon>
      <NavBarIcon
        href="#"
        alignment="right"
        title="Account"
        menu={
          <Menu>
            <Menu.Header>Your account</Menu.Header>
            <Menu.Link url="#">Change my information</Menu.Link>
          </Menu>
        }
      >
        <AccountIcon />
      </NavBarIcon>
      <NavBarIcon
        href="#"
        alignment="right"
        title="Menu"
        menu={
          <Menu>
            <Menu.Header>Main navigation</Menu.Header>
            <Menu.Link url="#">First menu item</Menu.Link>
            <Menu.Link url="#">Second menu item</Menu.Link>
            <Menu.Link url="#">Third menu item</Menu.Link>
          </Menu>
        }
      >
        <BurgerMenu />
      </NavBarIcon>
    </NavBar>
  </>
))
