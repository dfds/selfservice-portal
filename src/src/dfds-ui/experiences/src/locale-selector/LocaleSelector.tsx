import React, { useState, PropsWithChildren, forwardRef } from 'react'
import { LinkButton, Locale, localeData, LocaleFlag, locales as allLocales } from '@/dfds-ui/react-components/src'
import { Modal, ModalProps } from '@/dfds-ui/modal/src'
import { css } from '@emotion/react'
import LocaleOption from './LocaleOption'
import { media, theme } from '@/dfds-ui/theme/src'

export type LocaleSelectorProps = PropsWithChildren<
  {
    /**
     * Provide limited set of locales to choose from
     */
    locales?: ReadonlyArray<Locale>
    /**
     * Text to display on button that open the selector as
     * well as in the heading of the selector
     */
    label?: string
    /**
     * Current locale of the application
     */
    currentLocale: Locale
    /** Callback function that fires with locale as an argument */
    onChange: (locale: Locale) => void
    /** Disabled visual appearance and interaction disabled. */
    disabled?: boolean
    /**
     * className to be assigned to component.
     */
    className?: string
  } & Pick<ModalProps, 'renderWhenClosed'>
>

/**
 * A component to display a modal window where the user can select a locale.
 */
export const LocaleSelector = forwardRef(
  (
    {
      locales = allLocales,
      label = 'Website and language',
      currentLocale,
      renderWhenClosed = true,
      onChange,
      disabled = false,
      className,
    }: LocaleSelectorProps,
    _ref
  ) => {
    const [showLocaleModal, setShowLocaleModal] = useState(false)

    const handleChangeLocale = (locale: Locale) => {
      onChange(locale)
      setShowLocaleModal(false)
    }
    const handleShowLocalButton = () => {
      if (!disabled) setShowLocaleModal(true)
    }
    const LARGE_THRESHOLD = 9 // minimum number of locales before supporting 3 columns
    const largeSize = locales.length >= LARGE_THRESHOLD ? '840px' : '560px'
    const sizes = { s: 'fullscreen', m: '560px', l: '560px', xl: largeSize, xxl: largeSize }

    return (
      <>
        <LinkButton
          css={css`
            color: ${theme.colors.text.primary.primary};
          `}
          size="small"
          disabled={disabled}
          icon={
            <LocaleFlag
              locale={currentLocale}
              css={css`
                margin-left: 0.5rem;
                font-size: 1.25rem;
              `}
            />
          }
          iconAlign="right"
          onClick={handleShowLocalButton}
          className={className}
        >
          {label && label}
        </LinkButton>
        <Modal
          heading={label}
          isOpen={showLocaleModal}
          shouldCloseOnEsc={true}
          onRequestClose={() => setShowLocaleModal(false)}
          renderWhenClosed={renderWhenClosed}
          sizes={sizes}
          noContentPadding
        >
          <div
            css={css`
              padding: 0.5rem;
              column-count: 1;
              @media (min-width: 480px) {
                column-count: 2;
              }
              ${locales.length >= LARGE_THRESHOLD &&
              media.greaterThan('xl')`
                column-count: 3;
              `}
            `}
          >
            {locales.map((locale) => {
              return (
                <LocaleOption
                  onClick={() => handleChangeLocale(locale)}
                  key={locale}
                  locale={locale}
                  label={localeData[locale].nativeName}
                />
              )
            })}
          </div>
        </Modal>
      </>
    )
  }
)

export default LocaleSelector
