import React from 'react'
import { render } from '@testing-library/react'
import { Dropdown, MenuItem, MenuTitle, MenuCheckbox } from '..'
import { Yes, Edit } from '@/components/dfds-ui/icons/system/'
import { FlagGb } from '@/components/dfds-ui/icons/flags/'

const fakeReferenceObject = {
  clientWidth: 0,
  clientHeight: 0,
  getBoundingClientRect: () => {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => undefined,
    }
  },
}

describe('<Dropdown/>', () => {
  it('should render without errors the medium size DropdownMenu', () => {
    render(
      <Dropdown isOpen setIsOpen={(open) => !open} anchorEl={fakeReferenceObject}>
        <MenuTitle>Section</MenuTitle>
        <MenuCheckbox clickable>body</MenuCheckbox>
        <MenuItem clickable iconRight={Yes}>
          body
        </MenuItem>
      </Dropdown>
    )
  })

  it('should render without errors the medium size DropdownMenu', () => {
    render(
      <Dropdown isOpen setIsOpen={(open) => !open} anchorEl={fakeReferenceObject}>
        <MenuTitle>Section</MenuTitle>
        <MenuCheckbox clickable>body</MenuCheckbox>
        <MenuItem clickable iconLeft={FlagGb}>
          body
        </MenuItem>
      </Dropdown>
    )
  })

  it('should render without errors the small size Dropdown', () => {
    render(
      <Dropdown isOpen setIsOpen={(open) => !open} size="small" anchorEl={fakeReferenceObject}>
        <MenuTitle>Section</MenuTitle>
        <MenuCheckbox clickable>body</MenuCheckbox>
        <MenuItem clickable iconRight={Yes}>
          body
        </MenuItem>
      </Dropdown>
    )
  })

  it('should render without errors the medium size MenuItem with and without icon', () => {
    render(
      <Dropdown isOpen setIsOpen={(open) => !open} anchorEl={fakeReferenceObject}>
        <MenuItem clickable>body</MenuItem>
        <MenuItem clickable iconRight={Edit}>
          body
        </MenuItem>
      </Dropdown>
    )
  })

  it('should render without errors the small size MenuItem with and without icon', () => {
    render(
      <Dropdown isOpen setIsOpen={(open) => !open} size="small" anchorEl={fakeReferenceObject}>
        <MenuItem clickable>body</MenuItem>
        <MenuItem clickable iconRight={Edit}>
          body
        </MenuItem>
      </Dropdown>
    )
  })
})
