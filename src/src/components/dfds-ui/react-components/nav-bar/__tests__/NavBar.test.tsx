import React from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { getByTitle, queryAllByText } from '@testing-library/dom'
import NavBar, { NavBarItem, NavBarIcon } from '../NavBar'
import Menu from '../../menu/Menu'

afterEach(cleanup)

describe('<NavBar />', () => {
  it('should render without errors', () => {
    render(<NavBar />)
  })

  it('should render children', () => {
    const { queryAllByText } = render(
      <NavBar>
        <NavBarItem href="#">NavBarItem 1</NavBarItem>
        <NavBarItem href="#">NavBarItem 2</NavBarItem>
      </NavBar>
    )
    expect(queryAllByText(/NavBarItem \d/).length).toBe(2)
  })

  it('should render logo', () => {
    const { getAllByTestId } = render(<NavBar />)
    const test = getAllByTestId('Logo')
    expect(test).toBeTruthy()
  })

  it('should render without logo with showLogo set to false', () => {
    const { container } = render(<NavBar showLogo={false} />)
    expect(container.querySelector('Logo')).toBeFalsy()
  })

  it('should render anchor around logo with href', () => {
    const { getByTestId } = render(<NavBar href="/home" />)
    expect(getByTestId('LogoLink')).toBeTruthy()
    const link: any = getByTestId('LogoLink')
    expect(link.href).toContain('/home')
  })

  it('should render menu items when icon is clicked', () => {
    const { container } = render(
      <NavBar href="/home">
        <NavBarIcon
          href="#"
          alignment="right"
          title="Menu"
          menu={
            <Menu>
              <Menu.Header>Test navigation</Menu.Header>
              <Menu.Link url="url1">Menu item 1</Menu.Link>
              <Menu.Link url="url2">Menu item 2</Menu.Link>
              <Menu.Link url="url3">Menu item 3</Menu.Link>
            </Menu>
          }
        />
      </NavBar>
    )

    const burger = getByTitle(container, 'Menu')
    let subItems = queryAllByText(container, /Menu item \d/)
    expect(subItems.length).toBe(0)

    fireEvent.click(burger)

    subItems = queryAllByText(container, /Menu item \d/)
    expect(subItems.length).toBe(3)
  })
})
