import React from 'react'
import { css } from '@emotion/react'
import emotionCloneElement from '../common/emotionCloneElement'
import { media } from '@/components/dfds-ui/theme'

type Orientation = 'horizontal' | 'vertical'
type Alignment = 'left' | 'right' | 'center'

type ButtonStackProps = {
  align?: Alignment
  orientation?: Orientation
  className?: string
  reverse?: boolean // virtually reverses the order with row-reverse
}

// TODO: Reafctor into the theme
const space = 8

const containerStyles = ({ orientation, align, reverse }: Partial<ButtonStackProps>) => css`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;

  ${media.greaterThan('s')`
    flex-direction: ${orientation === 'horizontal' ? 'row' : 'column'};
    flex-direction: ${reverse && 'row-reverse'};
    justify-content: ${align === 'left' ? 'flex-start' : 'flex-end'};
    margin-left: ${orientation === 'horizontal' && `-8px`};
  `}

  ${media.greaterThan('m')`
    justify-content: ${align === 'left' ? 'flex-start' : 'flex-end'};
  `}
`

const verticalItemStyles = css`
  display: flex;
  flex-grow: 1;
  margin: ${space / 2}px 0 ${space / 2}px 0;
`

const horizontalStyles = ({ align }: Partial<ButtonStackProps>) => css`
  display: flex;
  flex-grow: ${align === 'center' ? 1 : 0};
  flex-shrink: 1;
  margin: ${space / 2}px 0 ${space / 2}px 0;

  ${media.greaterThan('s')`
    flex-shrink: 0;
    flex-basis: ${align === 'center' ? '0%' : 'auto'};
    margin: ${space / 2}px 0 ${space / 2}px ${space}px;
  `}
  ${media.greaterThan('s')`
    max-width: ${align === 'center' ? 'calc(100% - 10px)' : `calc(66% - ${space / 2}px)`};
  `}
  ${media.gt('m')`
    max-width: calc(100% - 10px);
  `}
`
const ButtonStack: React.FunctionComponent<ButtonStackProps> = ({
  align = 'left',
  orientation = 'horizontal',
  reverse,
  className,
  children,
  ...rest
}) => {
  return (
    <div className={className}>
      <div css={containerStyles({ orientation, align, reverse })} {...rest}>
        {React.Children.map(children, (child) => {
          return React.isValidElement<any>(child)
            ? emotionCloneElement(child, {
                css: [child.props.css, orientation === 'horizontal' ? horizontalStyles({ align }) : verticalItemStyles],
              })
            : child
        })}
      </div>
    </div>
  )
}

export default ButtonStack
