import React from 'react'
import { storiesOf } from '@storybook/react'
import { Drawer } from './'

import { StoryPage, Md, ExampleContainer, Paper } from '@dfds-ui/storybook-design'
import { css } from '@emotion/react'
import { ListText, ListItem } from '../lists'
import { MoreHorizontal } from '@dfds-ui/icons/system'

const stories = storiesOf('Hydro UI/Surfaces/Drawer', module)

stories.add('Drawer', () => {
  return (
    <StoryPage>
      {Md`
# Drawer

The Drawer is a component that is visual connected to another element. As an example it can used to display a dropdown menu.

This implementation is currently incomplete as it lacks basic functionality like calculating its own position (eg. with popperjs).

For now it only support a \`position\` prop with valid values of \`left\` and \`right\`. It will always be displayed underneath the connected element

`}
      {Md`
## Position left
By default, the drawer \`position\` prop is set to \`left\`.
`}
      <ExampleContainer
        headline="Example position left"
        css={css`
          min-height: 150px;
        `}
      >
        <div
          css={css`
            position: relative;
            padding: 10px;
            background-color: #eee;
            width: 300px;
          `}
        >
          Element with drawer
          <Drawer>
            <ListItem clickable>
              <ListText>List item inside the drawer</ListText>
            </ListItem>
          </Drawer>
        </div>
      </ExampleContainer>
      {Md`
~~~jsx
import { Drawer, ListItem, ListText } from '@/components/dfds-ui/react-components';

<div>
  Element with Drawer
  <Drawer>
    <ListItem clickable>
      <ListText>List item inside the drawer</ListText>
    </ListItem>
  </Drawer>
</div>
~~~
`}
      {Md`
## Position right
Set the prop \`position\` to \`right\` to have the arrow on the right side of the drawer.
`}
      <ExampleContainer
        headline="Example position right"
        css={css`
          min-height: 150px;
        `}
      >
        <div
          css={css`
            position: relative;
            padding: 10px;
            background-color: #eee;
            width: 300px;
          `}
        >
          Element with drawer
          <Drawer position="right">
            <ListItem clickable>
              <ListText>List item inside the drawer</ListText>
            </ListItem>
          </Drawer>
        </div>
      </ExampleContainer>
      {Md`
~~~jsx
import { Drawer, ListItem, ListText } from '@/components/dfds-ui/react-components';

<div>
  Element with Drawer
  <Drawer position="right">
    <ListItem clickable>
      <ListText>List item inside the drawer</ListText>
    </ListItem>
  </Drawer>
</div>
~~~
`}
      {Md`
## Vertical position top
Set the prop \`verticalPosition\` to \`top\` to have the drawer on top and the arrow on bottom.
`}
      <ExampleContainer
        headline="Example vertical position top"
        css={css`
          min-height: 150px;
        `}
      >
        <div
          css={css`
            position: relative;
            top: 50px;
            padding: 10px;
            background-color: #eee;
            width: 300px;
          `}
        >
          Element with drawer
          <Drawer
            verticalPosition="top"
            css={css`
              position: absolute;
              top: -55px;
            `}
          >
            <ListItem clickable>
              <ListText>List item inside the drawer</ListText>
            </ListItem>
          </Drawer>
        </div>
      </ExampleContainer>
      {Md`
~~~jsx
import { Drawer, ListItem, ListText } from '@/components/dfds-ui/react-components';

<div>
  Element with Drawer
  <Drawer verticalPosition="top">
    <ListItem clickable>
      <ListText>List item inside the drawer</ListText>
    </ListItem>
  </Drawer>
</div>
~~~
`}

      {Md`
## Elevation
By default, the drawer \`elevation\` prop is set to \`4\`.
`}
      <ExampleContainer
        headline="Example elevation 16"
        css={css`
          min-height: 150px;
        `}
      >
        <div
          css={css`
            position: relative;
            padding: 10px;
            background-color: #eee;
            width: 300px;
          `}
        >
          Element with drawer
          <Drawer elevation="16">
            <ListItem clickable>
              <ListText>List item inside the drawer</ListText>
            </ListItem>
          </Drawer>
        </div>
      </ExampleContainer>
      {Md`
~~~jsx
import { Drawer, ListItem, ListText } from '@/components/dfds-ui/react-components';

<div>
  Element with Drawer
  <Drawer elevation="16">
    <ListItem clickable>
      <ListText>List item inside the drawer</ListText>
    </ListItem>
  </Drawer>
</div>
~~~
`}
    </StoryPage>
  )
})

stories.add('Examples', () => {
  return (
    <StoryPage>
      {Md`
## Examples
`}
      <ExampleContainer>
        <Paper
          css={css`
            min-height: 300px;
            max-width: 450px;
          `}
        >
          <div
            css={css`
              display: flex;
              background-color: rgba(255, 255, 255, 0.5);
            `}
          >
            <div
              css={css`
                position: relative;
                margin-left: auto;
                background-color: white;
              `}
            >
              <MoreHorizontal
                css={css`
                  font-size: 20px;
                  padding: 15px;
                  margin: 0 5px;
                  background-color: white;
                `}
              />
              <Drawer
                position="right"
                css={css`
                  min-width: 200px;
                `}
              >
                {['list item 1', 'list item 2', 'list item 3'].map((item) => {
                  return (
                    <ListItem key={item} clickable>
                      <ListText>list {item}</ListText>
                    </ListItem>
                  )
                })}
              </Drawer>
            </div>
          </div>
        </Paper>
      </ExampleContainer>
    </StoryPage>
  )
})
