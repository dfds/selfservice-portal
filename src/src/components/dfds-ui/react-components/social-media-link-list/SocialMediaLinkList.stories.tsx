import React from 'react'
import { storiesOf } from '@storybook/react'
import { Md } from '@dfds-ui/storybook-design'
import { SocialMediaLinkList } from '.'

const stories = storiesOf('Hydro UI/SocialMediaLinkList', module)

stories.add('SocialMediaLinkList', () => {
  return (
    <>
      <SocialMediaLinkList
        instagramLink={'https://www.instagram.com/dfdsgroup/?hl=en'}
        facebookLink={'https://www.facebook.com/dfdsdk/'}
        blogLink={'link'}
        twitterLink={'link'}
        linkedinLink={'link'}
        youtubeLink={'link'}
        colorOverwrite={''}
      />
      {Md`
 ~~~jsx
 import { SocialMediaLinkList } from '@/components/dfds-ui/react-components';

 props:
  instagramLink?: string
  facebookLink?: string
  blogLink?: string
  twitterLink?: string
  linkedinLink?: string
  youtubeLink?: string
  iconSize?: string ('25px')
  noPadding?: boolean
  colorOverwrite?: string ('#ed8b00')

 const instagramLink = 'https://www.instagram.com/dfdsgroup/?hl=en'
 const facebookLink={'https://www.facebook.com/dfdsdk/'}

 <SocialMediaLinkList instagramLink={instagramLink} facebookLink={'https://www.facebook.com/dfdsdk/'} />
 ~~~
`}
    </>
  )
})
