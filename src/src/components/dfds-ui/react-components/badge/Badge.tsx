import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import { Text } from '@/components/dfds-ui/typography'
import { Intent, getIntentColor, getIntentTextColor } from '../common/intent'
import FlexBox, { FlexBoxProps } from '../flexbox/FlexBox'

export type BadgeProps = {
  /**
   * Specifies the intent of the Badge
   */
  intent?: Intent

  /**
   * Text to be shown in the badge (usually just a string)
   */
  children: React.ReactNode
  /**
   * Class name to be added to the badge
   */
  className?: string

  /**
   * Props controlling the flexbox
   */
  flexBoxProps?: FlexBoxProps

  /**
   * HTML tag or custom component being rendered
   */
  as?: React.ElementType
}

export default function Badge({
  as = 'div',
  children,
  intent = 'none',
  flexBoxProps = { inline: true },
  ...rest
}: BadgeProps) {
  return (
    <FlexBox
      as={as}
      css={css`
        align-items: center;
        background-color: ${getIntentColor(intent)};
        border-radius: 0.625rem;
        color: ${getIntentTextColor(intent)};
        height: 1.25rem;
        max-width: ${flexBoxProps.inline && `calc(100% - ${theme.spacing.xs})`};
        padding: 0 ${theme.spacing.xs};
      `}
      {...flexBoxProps}
      {...rest}
    >
      <Text
        css={css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `}
        styledAs="bodyInterfaceSmall"
      >
        {children}
      </Text>
    </FlexBox>
  )
}
