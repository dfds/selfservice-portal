import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'
import { typography } from '@dfds-ui/typography'

export type AccordionContentProps = {
  /**
   * The compressed variant removes the `margin-bottom` of the Accordion.
   */
  variant?: 'default' | 'compressed'
  /**
   * Specify the content padding of the Accordion.
   */
  type?: 'small' | 'medium'
}

export const AccordionContent: React.FunctionComponent<AccordionContentProps> = ({
  variant,
  type,
  children,
  ...rest
}) => {
  return (
    <div
      className="accordion__content"
      css={css`
        ${typography.body};
        margin-bottom: ${variant === 'default' ? theme.spacing.xs : '0'};
        padding: 0 ${theme.spacing.s} ${theme.spacing.s};
        background-color: white;
        color: ${theme.colors.text.dark.primary};
      `}
      {...rest}
    >
      {children}
    </div>
  )
}

export default AccordionContent
