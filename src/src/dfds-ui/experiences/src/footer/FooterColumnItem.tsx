import React, { FC } from 'react'
import { theme, media } from '@/dfds-ui/theme/src'
import { css } from '@emotion/react'
import { LinkButton, LinkButtonProps } from '@/dfds-ui/react-components/src'

export type FooterColumnItemProps = {
  className?: string
} & LinkButtonProps

export const FooterColumnItem: FC<FooterColumnItemProps> = ({ children, className, ...rest }) => (
  <LinkButton
    className={className}
    size="small"
    css={css`
      align-self: flex-start;
      margin: 4px 0;
      color: ${theme.colors.text.primary.secondary};

      &:focus,
      &:hover {
        color: ${theme.colors.text.primary.primary};
      }

      ${media.greaterThan('m')`
        margin: 2px 0;

        &:last-child {
          margin-bottom: 0;
        }
      `}
    `}
    {...rest}
  >
    {children}
  </LinkButton>
)

export default FooterColumnItem
