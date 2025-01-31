import React from 'react'
import { storiesOf } from '@storybook/react'
import { StoryPage, Md, ExampleContainer } from '@dfds-ui/storybook-design'
import PasswordField from './PasswordField'

const stories = storiesOf('Legacy/PasswordField', module)

stories.add('PasswordField', () => {
  const Demo = () => {
    const [value, setValue] = React.useState('')

    return <PasswordField label="Password" value={value} onChange={(event: any) => setValue(event.target.value)} />
  }

  return (
    <>
      <StoryPage>
        {Md`
# Password Field
\`PasswordField\` is a high level composite component for text input \n
`}
        <ExampleContainer>
          <Demo />
          {Md`
~~~jsx
import { PasswordField } from '@/components/dfds-ui/react-components';

const [myValue, setMyValue] = React.useState('');

<PasswordField label="my-label" value={myValue} onChange={event => setMyValue(event.target.value)} />
~~~
`}
        </ExampleContainer>
      </StoryPage>
    </>
  )
})
