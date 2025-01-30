import * as React from 'react'
import Button, { ButtonProps } from './Button'
import { theme } from '@dfds-ui/theme'
import { css } from '@emotion/react'

export type LinkButtonProps = React.PropsWithoutRef<JSX.IntrinsicElements['a']> &
  ButtonProps & {
    href?: string
    target?: string
  }

export const LinkButton = (props: LinkButtonProps) => (
  <Button
    as="a"
    variation="link"
    iconSpacing={theme.spacing.xxs}
    tabIndex={props.disabled ? -1 : 0}
    css={css`
      &:focus {
        color: ${theme.colors.secondary.dark};
      }
    `}
    {...props}
  />
)

export default LinkButton
