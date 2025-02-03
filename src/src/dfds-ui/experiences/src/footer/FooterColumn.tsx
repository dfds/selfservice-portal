import React, { FC, ReactElement, ReactNode } from 'react'
import { FlexBox } from '@/dfds-ui/react-components/src/flexbox'
import { Text } from '@/dfds-ui/typography/src'
import { css } from '@emotion/react'
import { theme, media } from '@/dfds-ui/theme/src'
import { FooterColumnItemProps } from './FooterColumnItem'

export type FooterColumnProps = {
  children: ReactElement<FooterColumnItemProps> | ReactElement<FooterColumnItemProps>[]
  /**
   * Column title
   */
  title?: ReactNode
}

export const FooterColumn: FC<FooterColumnProps> = ({ children, title, ...rest }) => {
  return (
    <FlexBox
      directionColumn
      css={css`
        margin-bottom: 1.5rem;

        &:last-of-type {
          margin-bottom: 0;
        }

        ${media.lessThan('l')`
          min-width: 330px;
        `}

        min-width: 210px;
      `}
      {...rest}
    >
      <Text
        styledAs="labelBold"
        css={css`
          margin: 0;
          padding-bottom: 0.5rem;
          color: ${theme.colors.text.primary.primary};
        `}
      >
        {title}
      </Text>
      <FlexBox directionColumn>{children}</FlexBox>
    </FlexBox>
  )
}

export default FooterColumn
