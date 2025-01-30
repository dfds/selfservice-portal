import React, { ComponentPropsWithoutRef } from 'react'
import { css } from '@emotion/react'
import * as flags from '@dfds-ui/icons/flags'
import { Locale, LocaleInfo, fallbackLocale, localeData } from './locales'

export type LocaleFlagProps = {
  /**
   * The locale specifying which flag will be rendered.
   */
  locale: Locale
  /**
   * The size of the flag icon.
   */
  size?: 's' | 'm' | 'l' | 'xl'
} & ComponentPropsWithoutRef<'svg'>

const sizes: { [k in NonNullable<LocaleFlagProps['size']>]: string } = {
  s: '1rem',
  m: '1.25rem',
  l: '1.875rem',
  xl: '2.5rem',
}

export const LocaleFlag = ({ locale, size = 'm', ...rest }: LocaleFlagProps) => {
  const localDataWithFallback: LocaleInfo = localeData[locale] ?? localeData[fallbackLocale]
  const Icon = flags[localDataWithFallback?.flagIcon]
  return (
    <Icon
      role="img"
      css={css`
        font-size: ${sizes[size]};
      `}
      {...rest}
    />
  )
}
