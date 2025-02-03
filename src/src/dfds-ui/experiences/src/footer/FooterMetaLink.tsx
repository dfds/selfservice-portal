import React, { FC } from 'react'
import { theme, media } from '@/dfds-ui/theme/src'
import { css } from '@emotion/react'
import { LinkButton, LinkButtonProps } from '@/dfds-ui/react-components/src'

export type FooterMetaLinkProps = {
  className?: string
} & LinkButtonProps

export const FooterMetaLink: FC<FooterMetaLinkProps> = ({ children, className, ...rest }) => (
  <LinkButton
    className={className}
    css={css`
      color: ${theme.colors.text.primary.secondary};
      margin-bottom: 0.25rem;

      &:last-of-type {
        margin-bottom: 0;
      }

      &:focus,
      &:hover {
        color: ${theme.colors.text.primary.primary};
      }

      ${media.greaterThan('m') &&
      css`
        margin-bottom: 0;
        margin-right: 1rem;

        &:last-of-type {
          margin-right: 0;
        }
      `}
    `}
    {...rest}
  >
    {children}
  </LinkButton>
)

export default FooterMetaLink
