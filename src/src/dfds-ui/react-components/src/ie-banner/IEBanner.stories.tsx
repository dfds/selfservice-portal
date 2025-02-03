import React from 'react'
import { storiesOf } from '@storybook/react'

import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'

import IEBanner from './IEBanner'

const stories = storiesOf('Hydro UI/Banners/IE Banner', module)

stories.add('IE Banner', () => (
  <StoryPage>
    {Md`
# IEBanner
Alerts the user if using old IE

If you're not using IE11 or below to view the playbook, set your User Agent string to:
~~~
Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko
~~~
    `}

    <ExampleContainer headline="Example - will be empty if not viewed in old IE">
      <IEBanner heading="Outdated browser" openInEdge="Open in Microsoft Edge">
        Please note we do not fully support Internet Explorer and recommend switching browser to e.g. Microsoft Edge,{' '}
        <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">
          Google Chrome
        </a>{' '}
        or{' '}
        <a href="https://www.mozilla.org/en/firefox/new/" target="_blank" rel="noopener noreferrer">
          Firefox
        </a>
        .
      </IEBanner>
    </ExampleContainer>
    {Md`
~~~jsx
import { IEBanner } from '@/dfds-ui/react-components/src';

<IEBanner heading="Outdated browser" openInEdge="Open in Microsoft Edge" track={trackBanner}>
  Please note we do not fully support Internet Explorer and recommend switching browser to e.g. Microsoft Edge,{' '}
  <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">
    Google Chrome
  </a>{' '}
  or{' '}
  <a href="https://www.mozilla.org/en/firefox/new/" target="_blank" rel="noopener noreferrer">
    Firefox
  </a>
  .
</IEBanner>
~~~
`}
  </StoryPage>
))
