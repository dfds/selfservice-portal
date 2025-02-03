import React from 'react'
import { css } from '@emotion/react'
import { theme } from '@/dfds-ui/theme/src'
import { typography } from '@/dfds-ui/typography/src'
import { Button, ButtonProps } from '@/dfds-ui/react-components/src'

export type ModalActionVariation = 'primary' | 'secondary'

export type ModalActionProps = {
  actionVariation?: ModalActionVariation
  onClick?: () => void
  /**
   * Class name to be assigned to the button
   */
  className?: string
  /**
   * HTML tag or custom component being rendered
   */
  as?: React.ElementType
} & Omit<ButtonProps, 'variation'>

const getVariationStyle = (actionVariation: ModalActionVariation) => {
  if (actionVariation === 'primary') {
    return css`
      color: ${theme.colors.text.light.primary};
      background: ${theme.colors.secondary.main};
      margin-right: ${theme.spacing.s};

      &:hover {
        color: ${theme.colors.text.light.primary};
      }
    `
  } else {
    return css`
      border: 1px solid ${theme.colors.secondary.main};
    `
  }
}

export const ModalAction: React.FunctionComponent<ModalActionProps> = ({ actionVariation = 'primary', ...rest }) => {
  return (
    <Button
      variation="text"
      type="button"
      css={css`
        ${typography.action};
        flex: auto;
        flex-basis: auto;
        flex-grow: 0;
        margin-left: ${theme.spacing.xs};
        padding: 0 ${theme.spacing.xs};
        ${getVariationStyle(actionVariation)}
      `}
      {...rest}
    />
  )
}

export default ModalAction
