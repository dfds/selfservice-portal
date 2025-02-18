import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import FlexBox from '../flexbox/FlexBox'
import { Blog, Facebook, Instagram, LinkedIn, MailShare, Twitter, Youtube } from '@/components/dfds-ui/icons'

export type SocialMediaLinkListProps = {
  instagramLink?: string
  facebookLink?: string
  blogLink?: string
  twitterLink?: string
  linkedinLink?: string
  youtubeLink?: string
  mailshareLink?: string
  iconSize?: string
  noPadding?: boolean
  colorOverwrite?: string
}

export const SoMeWrapper = styled(FlexBox)<SocialMediaLinkListProps>`
  width: 100%;
  padding: ${({ noPadding }) => (noPadding ? '0' : '20px 20px 0')};

  a {
    width: ${({ iconSize }) => (iconSize ? iconSize : '30px')};
    height: ${({ iconSize }) => (iconSize ? iconSize : '30px')};
    margin: 0 25px 20px 0;

    svg path {
      fill: ${({ colorOverwrite }) => (colorOverwrite ? colorOverwrite : '')};
    }
  }
`

type socialMediaLinkListComponent = FunctionComponent<SocialMediaLinkListProps>

export const SocialMediaLinkList: socialMediaLinkListComponent = ({
  instagramLink,
  facebookLink,
  blogLink,
  twitterLink,
  linkedinLink,
  youtubeLink,
  mailshareLink,
  iconSize,
  noPadding,
  colorOverwrite,
  ...rest
}) => {
  return (
    <SoMeWrapper colorOverwrite={colorOverwrite} noPadding={noPadding} wrapWrap iconSize={iconSize} {...rest}>
      {facebookLink && (
        <a href={facebookLink} target="_blank" rel="noopener noreferrer">
          <Facebook height={iconSize} width={iconSize} />
        </a>
      )}
      {blogLink && (
        <a href={blogLink} target="_blank" rel="noopener noreferrer">
          <Blog height={iconSize} width={iconSize} />
        </a>
      )}
      {instagramLink && (
        <a href={instagramLink} target="_blank" rel="noopener noreferrer">
          <Instagram height={iconSize} width={iconSize} />
        </a>
      )}
      {linkedinLink && (
        <a href={linkedinLink} target="_blank" rel="noopener noreferrer">
          <LinkedIn height={iconSize} width={iconSize} />
        </a>
      )}
      {twitterLink && (
        <a href={twitterLink} target="_blank" rel="noopener noreferrer">
          <Twitter height={iconSize} width={iconSize} />
        </a>
      )}
      {youtubeLink && (
        <a href={youtubeLink} target="_blank" rel="noopener noreferrer">
          <Youtube height={iconSize} width={iconSize} />
        </a>
      )}
      {mailshareLink && (
        <a href={mailshareLink} target="_blank" rel="noopener noreferrer">
          <MailShare height={iconSize} width={iconSize} />
        </a>
      )}
    </SoMeWrapper>
  )
}

export default SocialMediaLinkList
