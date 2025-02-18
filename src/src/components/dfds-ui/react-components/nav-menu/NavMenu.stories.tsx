import React from 'react'
import { storiesOf } from '@storybook/react'
import ListItem from '../lists/ListItem'

const stories = storiesOf('UI/NavMenu', module)

stories.add('NavMenu', () => (
  <>
    <div>
      <ListItem selected>Basic information</ListItem>
      <ListItem>Consents</ListItem>
      <ListItem>Address</ListItem>
      <ListItem>Payment methods</ListItem>
    </div>
  </>
))
