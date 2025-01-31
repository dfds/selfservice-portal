import React from 'react'
import { css } from '@emotion/react'
import { IconButton } from '../button'
import { Yes, MoreHorizontal, StatusAlert } from '@/components/dfds-ui/icons/system'
import { Button } from '../button'
import { theme } from '@/components/dfds-ui/theme'
import StepContext from './StepContext'

type StepButtonProps = | React.ButtonHTMLAttributes<HTMLButtonElement> 

const buttonStyles = ({ active, completed = false }: { active: boolean; completed?: boolean }) => css`
  border-radius: 50%;
  padding: 0;
  background-color: ${active || completed ? theme.colors.secondary.main : theme.colors.text.primary.disabled};
  font-weight: ${active || completed ? 'bold' : ''};
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  :hover {
    color: #fff;
  }

  svg {
    width: 15px;
    height: 15px;
  }
`

const costumeButtonStyles = css`
  border-radius: 50%;
  padding: 0;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`
const editButtonStyles = css`
  background-color: ${theme.colors.secondary.main};
  padding: 0;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 15px;
    height: 15px;
  }
`

const StepButtonElement: React.FC<StepButtonProps> = ({ ...rest }) => {
  const { completed, index, active, hasError, isEditing, disabled } = React.useContext(StepContext)
  if (hasError) {
    return (
      <IconButton
        disabled={disabled}
        data-testid="step-button-error"
        {...rest}
        icon={StatusAlert}
        ariaLabel="Error"
        color={theme.colors.status.alert}
        css={costumeButtonStyles}
        disableOverlay
      />
    )
  } else if (isEditing) {
    return (
      <IconButton
        disabled={disabled}
        {...rest}
        data-testid="step-button-editing"
        size="small"
        color="white"
        icon={MoreHorizontal}
        ariaLabel="Completed"
        css={editButtonStyles}
        disableOverlay
      />
    )
  } else if (completed) {
    return (
      <IconButton
        disabled={disabled}
        {...rest}
        data-testid="step-button-completed"
        size="small"
        color="white"
        icon={Yes}
        ariaLabel="Completed"
        css={buttonStyles({ active, completed })}
        disableOverlay
      />
    )
  }
  return (
    <Button
      disabled={disabled}
      data-testid="step-button-index"
      {...rest}
      size="small"
      variation="text"
      color="white"
      css={buttonStyles({ active, completed })}
    >
      {index + 1}
    </Button>
  )
}
const StepButton: React.FC<StepButtonProps> = ({ ...rest }) => {
  return (
    <div
      data-testid="step-button"
      css={css`
        position: relative;
        padding: 0;
        width: 1.5em;
        height: 1.5em;
        min-width: 1.5em;
        min-height: 1.5em;
      `}
    >
      <StepButtonElement {...rest} />
    </div>
  )
}
export default StepButton
