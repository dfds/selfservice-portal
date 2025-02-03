import React from 'react'
import { storiesOf } from '@storybook/react'

import { StoryPage, Md, ExampleContainer } from '@/dfds-ui/storybook-design'

import IEModal from './IEModal'

const stories = storiesOf('UI/IE Modal', module)

stories.add('IE Modal Solid', () => (
  <StoryPage>
    {Md`
# IEModal
Alerts the user if using old IE

If you're not using IE11 or below to view the playbook, set your User Agent string to:
~~~
Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko
~~~
    `}

    <ExampleContainer headline="Example - modal will only show when viewed in old IE">
      <IEModal
        heading="Browser incompatible"
        description="This website no longer supports Internet Explorer. To continue to the next page please use one of your other available browsers or download {Edge}, {Chrome} or {Firefox}."
        goToFrontPageText="Go to front page"
        openPageInEdgeText="Open page in Microsoft Edge"
        canClose={false}
      />
    </ExampleContainer>
    {Md`
~~~jsx
import { IEModal } from '@/dfds-ui/experiences';

<IEModal
  heading="Browser incompatible"
  description="This website no longer supports Internet Explorer. To continue to the next page please use one of your other available browsers or download {Edge}, {Chrome} or {Firefox}."
  goToFrontPageText="Go to front page"
  openPageInEdgeText="Open page in Microsoft Edge"
  isBackgroundTransparent={true}
/>
~~~
`}
  </StoryPage>
))

stories.add('IE Modal transparent', () => (
  <StoryPage>
    {Md`
# IEModal
Alerts the user if using old IE

If you're not using IE11 or below to view the playbook, set your User Agent string to:
~~~
Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko
~~~
    `}

    <ExampleContainer headline="Example - modal will only show when viewed in old IE">
      <IEModal
        heading="Browser incompatible"
        description="This website no longer supports Internet Explorer. To continue to the next page please use one of your other available browsers or download {Edge}, {Chrome} or {Firefox}."
        goToFrontPageText="Go to front page"
        openPageInEdgeText="Open page in Microsoft Edge"
        canClose={true}
      />
    </ExampleContainer>
    {Md`
~~~jsx
import { IEModal } from '@/dfds-ui/experiences';

<IEModal
  heading="Browser incompatible"
  description="This website no longer supports Internet Explorer. To continue to the next page please use one of your other available browsers or download {Edge}, {Chrome} or {Firefox}."
  goToFrontPageText="Go to front page"
  openPageInEdgeText="Open page in Microsoft Edge"
  canClose={true}
/>
~~~
`}
  </StoryPage>
))
