import React from 'react'
import { css } from '@emotion/react'
import { Button, Locale, LocaleFlag } from '@/dfds-ui/react-components/src'
import { theme } from '@/dfds-ui/theme/src'

export type LocaleOptionProps = {
  label: string
  locale: Locale
  onClick: () => void
}

export const LocaleOption = ({ label, locale, onClick }: LocaleOptionProps) => {
  return (
    <Button
      size="small"
      css={css`
        display: flex;
        text-align: left;
        white-space: normal;
        color: ${theme.colors.text.primary.primary};
        height: auto;
        padding: 0.875rem;
        width: 100%;
      `}
      onClick={onClick}
      iconAlign="left"
      icon={
        <LocaleFlag
          locale={locale}
          css={css`
            font-size: 1.25rem;
          `}
        />
      }
      variation="text"
    >
      {label}
    </Button>
  )
}

export default LocaleOption
