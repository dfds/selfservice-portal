import React from 'react'
import { render } from '@testing-library/react'
import { ListItem, ListText, ListTitle, ListTextGroup, ListIcon, ListAddon } from '..'
import { ChevronRight } from '@/components/dfds-ui/icons/system'

describe('<ListItem />', () => {
  it('should render without errors', () => {
    render(
      <ListItem>
        <ListText>Text</ListText>
      </ListItem>
    )
  })

  it('should render all components without errors', () => {
    render(
      <>
        <ListTitle divider>
          <ListText styledAs="smallHeadline">Title</ListText>
        </ListTitle>
        <ListItem multiline clickable divider as="a">
          <ListAddon>Addon</ListAddon>
          <ListTextGroup>
            <ListText styledAs="labelBold">Headline</ListText>
            <ListText styledAs="body">Sub</ListText>
          </ListTextGroup>
          <ListIcon size="xl" icon={ChevronRight} />
        </ListItem>
      </>
    )
  })
})
