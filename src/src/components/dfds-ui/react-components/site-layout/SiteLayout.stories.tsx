import React from 'react'
import { storiesOf } from '@storybook/react'
import { SiteLayout } from './'
import { NavBar, NavBarItem, NavBarIcon } from '../nav-bar'
import { Footer } from '../footer'
import { StoryPage, Md } from '@dfds-ui/storybook-design'
import { FlagInt } from '@dfds-ui/icons/flags'
import { Account, Menu as BurgerMenu } from '@dfds-ui/icons/system'

const stories = storiesOf('UI/SiteLayout', module)

const ExampleNavBar = () => {
  return (
    <>
      <NavBar href="/">
        <NavBarItem href="#">DFDS Platform</NavBarItem>
        <NavBarItem href="#">Rest of DFDS</NavBarItem>
        <NavBarIcon href="#" alignment="right">
          <BurgerMenu />
        </NavBarIcon>
        <NavBarIcon href="#">
          <Account />
        </NavBarIcon>
        <NavBarIcon href="#">
          <FlagInt />
        </NavBarIcon>
      </NavBar>
    </>
  )
}

stories.add('SiteLayout', () => {
  return (
    <StoryPage>
      {Md`
# SiteLayout
Exports a set of components which can be used to create a basic (header-main-footer) layout for an application.

It uses a css grid to define the areas.

~~~jsx
import { SiteLayout } from '@/components/dfds-ui/react-components';

<SiteLayout.Grid>
  <SiteLayout.Header>
    Header content
  </SiteLayout.Header>
  <SiteLayout.Main>
    Main content
  </SiteLayout.Main>
  <SiteLayout.Footer>
    Footer content
  </SiteLayout.Footer>
</SiteLayout.Grid>
~~~

## Full width
The content within \`SiteLayout.Header\`, \`SiteLayout.Main\` and \`SiteLayout.Footer\` has a \`max-width\` of \`1200px\` but can be set
to full width using the \`fullWidth\` prop.

\`fullWidth\` can also be set specifically on \`SiteLayout.Header\` and \`SiteLayout.Footer\`

~~~~jsx
// Setting fullWidth will override the \`max-width\` of \`1200px\`
<SiteLayout.Grid fullWidth>
~~~~

## As prop
~~~~jsx
// Setting \`as\` controls which element is being rendered
<SiteLayout.Grid>
  <SiteLayout.Header as="header">
    Header content
  </SiteLayout.Header>
  <SiteLayout.Main as="main">
    Main content
  </SiteLayout.Main>
  <SiteLayout.Footer as="footer">
    Footer content
  </SiteLayout.Footer>
</SiteLayout.Grid>
~~~~

`}
    </StoryPage>
  )
})

stories.add('Example', () => {
  return (
    <>
      <SiteLayout.Grid>
        <SiteLayout.Header as="header" fullWidth>
          <ExampleNavBar />
        </SiteLayout.Header>
        <SiteLayout.Main as="main">
          <h2>Content</h2>
          <p>Main content</p>
        </SiteLayout.Main>
        <SiteLayout.Footer as="footer">
          <Footer />
        </SiteLayout.Footer>
      </SiteLayout.Grid>
    </>
  )
})
