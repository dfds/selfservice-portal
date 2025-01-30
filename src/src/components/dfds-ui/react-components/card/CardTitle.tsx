import React, { FunctionComponent } from 'react'
import { Text } from '@dfds-ui/typography'
import { theme, useBreakpoint } from '@dfds-ui/theme'
import { CardContext } from './Card'
import { css } from '@emotion/react'

export type CardTitleProps = {
  /**
   * Text color
   */
  color?: string

  /**
   * If set to true the title will be displayed using the `sectionHeadline` instead of a `smallHeadline`.
   * But only for large screens.
   */
  largeTitle?: boolean

  /**
   * className to be assigned to the component
   */
  className?: string
}

const CardTitle: FunctionComponent<CardTitleProps> = ({ children, color, largeTitle = false, ...rest }) => {
  const { greaterThan } = useBreakpoint()

  const getPadding = (context: any) => {
    if (context.cardVariant === 'surface' && context.cardSize === 'xl' && greaterThan('l')) {
      return '0px'
    }
    return theme.spacing.s
  }

  return (
    <CardContext.Consumer>
      {(context) => (
        <div
          css={css`
            padding-top: ${getPadding(context)};
          `}
          {...rest}
        >
          <Text
            css={{ color: color ? color : theme.colors.text.primary.primary }}
            as={'div'}
            styledAs={largeTitle && greaterThan('l') ? 'sectionHeadline' : 'smallHeadline'}
          >
            {children}
          </Text>
        </div>
      )}
    </CardContext.Consumer>
  )
}

export default CardTitle
