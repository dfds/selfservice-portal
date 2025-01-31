import React from 'react'
import { storiesOf } from '@storybook/react'
import Menu from './Menu'
import { css } from '@emotion/react'

const stories = storiesOf('Hydro UI/Menus/Menu', module)

stories.add('Menu', () => (
  <>
    <Menu
      css={css`
        margin: 10px;
        width: 200px;
      `}
    >
      <Menu.Header>Header</Menu.Header>
      <Menu.Separator />
      <Menu.Link url="#">Menu link 1</Menu.Link>
      <Menu.Link url="#">Menu link 2</Menu.Link>
      <Menu.Link url="#">Menu link 3</Menu.Link>
      <Menu.Link url="#">Menu link 4</Menu.Link>
    </Menu>
  </>
))
