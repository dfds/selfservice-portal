import React from 'react'
import styled from '@emotion/styled'
import { theme, media } from '@/components/dfds-ui/theme'
import { Text } from '@/components/dfds-ui/typography'
import Stripes from './stripes'

const Container = styled.div`
  position: relative;
`

const Background = styled.div<Props>`
  background-color: ${(props) => (props.color ? props.color : theme.colors.primary.main)};
  height: 300px;
  width: 100%;
  position: absolute;
  z-index: 0;
  ${media.lessThan('m')`
    height: 0px;
  `}
`

const ContentWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 1200px;
  ${media.lessThan('m')`
    flex-direction: column-reverse;
    width: 100%;
  `}
`

const Info = styled.div<Props>`
  z-index: 2;
  background-color: ${(props) => (props.color ? props.color : theme.colors.primary.main)};
  * {
    color: ${theme.colors.surface.primary};
  }
  p {
    margin-top: ${theme.spacing.l};
    font-size: 20px;
  }

  ${media.lessThan('l')`
    p {
      font-size: 14px;
    }
  `}

  div {
    font-size: ${theme.spacing.xl};
  }

  ${media.lessThan('xl')`
    div {
      margin-right: ${theme.spacing.s}
    }
    * {
      margin-left: ${theme.spacing.m};
    }
  `}

  ${media.lessThan('l')`
    * { margin-left: ${theme.spacing.xl};
    }

    div {
      font-size: ${theme.spacing.l};
    }
  `}

  ${media.lessThan('m')`
    margin-top: -${theme.spacing.xxs};
    margin-left: 0;
    position: static;
    height: auto;
    min-height: 120px;
    padding: ${theme.spacing.s};
    span {
      font-size: 32px;
    }

    * {
      margin-left: 0px;
    }
    p {
      margin-top: 0px;
    }
  `}
`

const ImageWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
`

const ImageContainer = styled.div`
  width: 600px;
  height: 300px;
  ${media.lessThan('m')`
    width: 100%;
    height: 48vw;
  `}
`

const SvgWrapper = styled.div`
  svg {
    position: absolute;
    z-index: 1;
    width: 600px;
    height: 300px;
    ${media.lessThan('m')`
      width: 100%;
      height: auto;
    `}
  }
`

const Image = styled.img`
  position: absolute;
  width: 600px;
  height: 300px;
  ${media.lessThan('m')`
      width: 100%;
      height: auto;
    `}
`

type Props = {
  title: string
  headline: string
  headlineAs?: React.ElementType
  imageSrc: string
  color?: string
}

const Hero: React.FC<Props> = (props: Props) => {
  return (
    <Container>
      <Background {...props} />
      <ContentWrapper>
        <Content>
          <Info {...props}>
            <Text styledAs={'smallHeadline'}>{props.title}</Text>
            <Text as={props.headlineAs || 'div'} css={{ marginTop: 0, marginBottom: 0 }} styledAs={'heroHeadline'}>
              {props.headline}
            </Text>
          </Info>
          <ImageWrapper>
            <ImageContainer>
              <SvgWrapper>
                <Stripes {...props} />
              </SvgWrapper>
              <Image src={props.imageSrc} />
            </ImageContainer>
          </ImageWrapper>
        </Content>
      </ContentWrapper>
    </Container>
  )
}

export default Hero
