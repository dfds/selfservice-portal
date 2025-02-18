/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { FunctionComponent, ReactNode, useState } from 'react'
import styled from '@emotion/styled'
import { theme, media } from '@/components/dfds-ui/theme'
import { FlexBoxProps } from './../flexbox/FlexBox'
import { useDimensions } from '@/components/dfds-ui/hooks'
import cx from 'classnames'
import { css } from '@emotion/react'
import { useSurfaceContext, SurfaceType, MaybeSurfaceProvider } from '../surface'

export const CardContext = React.createContext({})

export type CardContextType = {
  cardSize: 's' | 'm' | 'l' | 'xl'
  cardVariant: 'outline' | 'fill' | 'surface'
}

export type CardProps = {
  size: 's' | 'm' | 'l' | 'xl'
  variant: 'outline' | 'fill' | 'surface'
  surface?: SurfaceType
  reverse?: boolean
  media?: ReactNode
  ratio?: number[]
  className?: string
}

type CardContentProps = {
  size: 's' | 'm' | 'l' | 'xl'
  variant: 'outline' | 'fill' | 'surface'
  width: number
  ratio: number
  reverse: boolean
}

type CardMediaProps = {
  ratio: number
}

const CardContainer = styled.div<CardProps & FlexBoxProps>`
  display: flex;
  flex-direction: column;
  border: ${(props) => (props.variant === 'outline' ? `solid 1px rgba(77, 78, 76, 0.24)` : '')};

  ${(props /* outline xl cards and greater than medium */) =>
    props.variant === 'outline' &&
    props.size === 'xl' &&
    !props.reverse &&
    media.greaterThan('l')`
      flex-direction: row;
  `}

  ${(props /* outline xl cards with reverse and greater than medium */) =>
    props.variant === 'outline' &&
    props.size === 'xl' &&
    props.reverse &&
    media.greaterThan('l')`
      flex-direction: row-reverse;
  `}

  ${(props /* fill xl cards and greater than medium */) =>
    props.variant === 'fill' &&
    props.size === 'xl' &&
    !props.reverse &&
    media.greaterThan('l')`
      flex-direction: row;
  `}

  ${(props /* fill xl cards with reverse and greater than medium */) =>
    props.variant === 'fill' &&
    props.size === 'xl' &&
    props.reverse &&
    media.greaterThan('l')`
      flex-direction: row-reverse;
  `}

  ${(props /* surface xl cards and greater than medium */) =>
    props.variant === 'surface' &&
    props.size === 'xl' &&
    !props.reverse &&
    media.greaterThan('l')`
      flex-direction: row;
  `}

  ${(props /* surface xl cards with reverse and greater than medium */) =>
    props.variant === 'surface' &&
    props.size === 'xl' &&
    props.reverse &&
    media.greaterThan('l')`
      flex-direction: row-reverse;
  `}

  .CardActions {
    a {
      margin-top: ${(props) => (props.variant === 'fill' || props.variant === 'outline' ? 'auto' : '')};
    }
  }
`

const CardContent = styled.div<CardContentProps>`
  display: flex;
  flex-direction: column;
  min-width: ${(props) => `calc(${props.ratio} * 100%)`};

  ${(props /* outline cards */) =>
    props.variant === 'outline' &&
    `
      padding: 0px ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.s};
  `}

  ${(props /* fill cards */) =>
    props.variant === 'fill' &&
    `
      padding: 0px ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.s};
  `}

  ${(props /* fill cards over 500 width */) =>
    props.variant === 'fill' &&
    props.width > 500 &&
    `
      padding: 0px ${theme.spacing.l} ${theme.spacing.s} ${theme.spacing.l};
  `}

  ${(props /* surface xl cards with reverse and greater than medium */) =>
    props.variant === 'surface' &&
    props.size === 'xl' &&
    !props.reverse &&
    media.greaterThan('l')`
    padding-left: ${theme.spacing.l};
  `}

  ${(props /* surface xl cards with reverse and greater than medium */) =>
    props.variant === 'surface' &&
    props.size === 'xl' &&
    props.reverse &&
    media.greaterThan('l')`
    padding-right: ${theme.spacing.l};
  `}
`

const MediaContainer = styled.div<CardMediaProps>`
  display: flex;
  flex-direction: column;
  min-width: ${(props) => `calc(${props.ratio} * 100%)`};
`

const MediaContent = styled.div<CardProps>`
  flex-direction: column;

  ${(props /* outline cards */) =>
    props.variant === 'outline' &&
    `
      padding: ${theme.spacing.s} ${theme.spacing.s} 0px ${theme.spacing.s};
  `}

  ${(props /* outline xl cards and greater than medium */) =>
    props.variant === 'outline' &&
    props.size === 'xl' &&
    !props.reverse &&
    media.greaterThan('l')`
      padding: ${theme.spacing.s} 0px ${theme.spacing.s} ${theme.spacing.s};
  `}

  ${(props /* outline xl cards with reverse and greater than medium */) =>
    props.variant === 'outline' &&
    props.size === 'xl' &&
    props.reverse &&
    media.greaterThan('l')`
    padding: ${theme.spacing.s} ${theme.spacing.s} ${theme.spacing.s} 0px;
  `}
`

const Card: FunctionComponent<CardProps> = ({
  children,
  media,
  variant,
  size,
  ratio: [contentRatio, mediaRatio] = [1, 1],
  className,
  surface: surfaceProp,
  ...rest
}) => {
  const [ref, { width }] = useDimensions()
  const { backgroundColor, textColors } = useSurfaceContext(surfaceProp)
  const [cardVariant] = useState(variant)
  const [cardSize] = useState(size)

  return (
    <CardContext.Provider
      value={{
        cardVariant,
        cardSize,
      }}
    >
      <MaybeSurfaceProvider surface={surfaceProp}>
        <CardContainer
          css={css`
            background-color: ${backgroundColor};
            color: ${textColors.primary};
          `}
          size={size}
          variant={variant}
          ref={ref}
          className={cx('CardContainer', className)}
          {...rest}
        >
          {media && (
            <MediaContainer ratio={mediaRatio / (mediaRatio + contentRatio)}>
              <MediaContent size={size} variant={variant} className="MediaContent" {...rest}>
                {media}
              </MediaContent>
            </MediaContainer>
          )}
          {children && (
            <CardContent
              className="CardContent"
              variant={variant}
              size={size}
              width={width}
              reverse={rest.reverse == true}
              ratio={contentRatio / (mediaRatio + contentRatio)}
              {...rest}
            >
              {children}
            </CardContent>
          )}
        </CardContainer>
      </MaybeSurfaceProvider>
    </CardContext.Provider>
  )
}

export default Card
