import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'
import { typography } from '@/components/dfds-ui/typography'
import { Intent, getIntentColor } from '../../common/intent'
import { IconButton } from '../../button'
import { Close } from '@/components/dfds-ui/icons/system'
import { CenteredSpinner } from '../../spinner/Spinner'
import { Button } from '../../button'

export type ToastProps = {
  intent?: Intent
  className?: string
  loading?: boolean
  onRequestClose?: () => void
  actionLabel?: string
  onRequestAction?: () => void
}

const ToastWrapper = styled.div<Partial<ToastProps>>`
  width: 284px;
  cursor: default;
  user-select: none;
  min-height: 3rem;
  box-shadow: ${theme.elevation['8']};
  color: ${theme.colors.surface.primary};
  background-color: ${(p) => getIntentColor(p.intent)};
  display: inline-flex;
  align-items: center;
  border-radius: ${theme.radii.m};
  overflow: hidden;
  box-sizing: border-box;
  padding: 0 0 0 1rem;
`

const ToastText = styled.div`
  ${typography.bodyInterface};
  margin: 1rem 1rem 1rem 0;
`

const Spinner = styled(CenteredSpinner)`
  transform: none;
  color: ${theme.colors.surface.primary};
  position: relative;
  margin-right: 18px;
  left: 0;
  top: 0;
`

const ActionButton = styled(Button)`
  color: ${theme.colors.text.light.secondary};
  font-weight: 400;
  height: 2rem;
  margin: 0.5rem 0.5rem 0.5rem auto;
  padding: 0;

  &:hover {
    color: ${theme.colors.text.light.primary};
  }

  &:focus {
    color: ${theme.colors.text.light.primary};
  }
`

const CloseIconButton = styled(IconButton)`
  height: 100%;
  padding: 0;
  color: ${theme.colors.text.light.secondary};

  &:hover {
    color: ${theme.colors.text.light.primary};
  }
`
const Toast: React.FunctionComponent<ToastProps> = ({
  intent = 'info',
  actionLabel = 'Action',
  onRequestClose,
  onRequestAction,
  children,
  loading,
  ...rest
}) => {
  const handleClose = () => onRequestClose && onRequestClose()
  const handleAction = () => onRequestAction && onRequestAction()

  return (
    <ToastWrapper intent={intent} {...rest}>
      {loading && <Spinner />}
      <ToastText>{children}</ToastText>
      {onRequestAction && (
        <ActionButton variation="text" onClick={handleAction}>
          {actionLabel}
        </ActionButton>
      )}
      {onRequestClose && (
        <span
          css={css`
            align-self: stretch;
            justify-self: center;
            margin-left: auto;
          `}
        >
          <CloseIconButton
            size="small"
            icon={Close}
            ariaLabel="Close"
            onClick={handleClose}
            data-testid="toast-close"
          />
        </span>
      )}
    </ToastWrapper>
  )
}

export default Toast
