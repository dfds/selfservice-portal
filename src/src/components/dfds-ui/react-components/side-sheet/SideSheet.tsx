import React, { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { media, theme } from '@/components/dfds-ui/theme'
import { FlexBox } from '../flexbox'
import SideSheetCloseButton from './SideSheetCloseButton'
import SideSheetHeader from './SideSheetHeader'
import SideSheetHeadline from './SideSheetHeadline'
import LockBodyScroll, { LockBodyScrollResult } from '../common/LockBodyScroll'

type Variant = 'nested' | 'elevated'

type BackdropEmphasis = 'low' | 'high'

type Align = 'left' | 'right'

export type SideSheetProps = {
  children?: React.ReactNode

  /**
   * Choose the `width` of the `SideSheet`.
   */
  header?: string

  /**
   * Choose the `width` of the `SideSheet`.
   */
  width?: string

  /**
   * When you trigger a close.
   */
  onRequestClose?: () => void

  /**
   * If set to true, the `SideSheet` is shown.
   */
  isOpen: boolean

  /**
   * Choose if the SideSheet should be nested or elevated.
   */
  variant?: Variant

  /**
   * Align the elevated SideSheet to left or right.
   */
  alignSideSheet?: Align

  /**
   * Style the SideSheet by adding a className to it.
   */
  className?: string

  /**
   * Add or remove the backdrop for the elevated side sheet.
   */
  backdrop?: boolean

  /**
   * Specify the emphasis of the backdrop.
   */
  backdropEmphasis?: BackdropEmphasis

  /**
   * Specify the custom zIndex.
   */
  zIndex?: number

  /**
   * Fullscreen on large mobile (breakpoint at 500px).
   */
  largeMobileFullScreen?: boolean

  /**
   * Fullscreen on small mobile (breakpoint at 375px).
   */
  smallMobileFullScreen?: boolean
}

const SideSheetStyle = ({
  isOpen,
  alignSideSheet,
  zIndex,
  variant,
  largeMobileFullScreen,
  smallMobileFullScreen,
  className,
  width,
  ...rest
}: SideSheetProps) => {
  return (
    <div
      className={className}
      css={css`
        /* FIXME: stretch doesn't seem to be valid for height */
        /* stylelint-disable */
        height: stretch;
        /* stylelint-enable */
        width: ${width};
        transform: ${!isOpen && 'translateX(100%)'};
        background-color: ${theme.colors.surface.primary};

        left: ${alignSideSheet === 'left' && 0};
        right: ${alignSideSheet === 'right' && 0};

        &.sheetActive {
          animation-name: 'slide-in';
          animation-duration: 400ms;
        }

        &.sheetInactive {
          animation-name: 'slide-out';
          animation-duration: 400ms;
        }

        @keyframes slide-out {
          0% {
            transform: translateX(0%);
            opacity: 0.5;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes slide-in {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        ${isOpen && alignSideSheet === 'left' && variant === 'nested'
          ? css`
              display: flex;
              flex-direction: column;
            `
          : isOpen && alignSideSheet === 'right' && variant === 'nested'
          ? css`
              display: flex;
              flex-direction: column;
            `
          : !isOpen && alignSideSheet === 'left' && variant === 'nested'
          ? css`
              display: none;
            `
          : css`
              display: none;
            `}
        ${variant === 'elevated' &&
        css`
          z-index: ${zIndex ? zIndex : 4000};
          box-shadow: ${isOpen && theme.elevation['8']};
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
        `}

        ${media.lessThanEqual(1000)`
          width: ${'66.6666%'};
        `}

        ${media.lessThanEqual(500)`
          width: ${largeMobileFullScreen ? '100%' : '80%'};
        `}

        ${media.lessThanEqual(375)`
          width: ${smallMobileFullScreen ? '100%' : '80%'};
        `}
      `}
      {...rest}
    />
  )
}

const SideSheetBackdrop = ({
  isOpen,
  onRequestClose,
  variant,
  zIndex,
  backdrop,
  className,
  backdropEmphasis,
}: Partial<SideSheetProps>) => {
  return (
    <div
      onClick={() => onRequestClose && onRequestClose()}
      className={className}
      css={css`
        z-index: ${zIndex ? zIndex - 1 : 3999};
        min-height: 100%;
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;

        ${variant === 'nested' &&
        css`
          display: none;
        `}
        ${isOpen &&
        variant === 'elevated' &&
        backdrop &&
        backdropEmphasis === 'high' &&
        css`
          &.backdropActive {
            animation-name: 'fade-in';
            animation-duration: 300ms;
            -webkit-animation-name: 'fade-in';
            -webkit-animation-duration: 300ms;
            -moz-animation-name: 'fade-in';
            -moz-animation-duration: 300ms;
            background-color: ${theme.colors.text.primary.secondary};
          }

          @keyframes fade-in {
            from {
              background-color: transparent;
            }
            to {
              background-color: ${theme.colors.text.primary.secondary};
            }
          }
        `}
        ${isOpen &&
        variant === 'elevated' &&
        backdrop &&
        backdropEmphasis === 'low' &&
        css`
          &.backdropActive {
            animation-name: 'fade-in';
            animation-duration: 300ms;
            -webkit-animation-name: 'fade-in';
            -webkit-animation-duration: 300ms;
            -moz-animation-name: 'fade-in';
            -moz-animation-duration: 300ms;
            background-color: ${theme.colors.text.light.secondary};
          }

          @keyframes fade-in {
            from {
              background-color: transparent;
            }
            to {
              background-color: ${theme.colors.text.light.secondary};
            }
          }
        `}
      `}
    />
  )
}

const SideSheet = ({
  variant = 'nested',
  className,
  isOpen = false,
  backdrop = false,
  width,
  header,
  zIndex,
  largeMobileFullScreen,
  smallMobileFullScreen,
  onRequestClose,
  backdropEmphasis = 'high',
  alignSideSheet = 'left',
  children,
  ...rest
}: SideSheetProps) => {
  const [opened, setOpened] = useState(false)
  const ref = React.useRef<LockBodyScrollResult>(null)

  useEffect(() => {
    if (isOpen && !opened) setOpened(true)

    // We remove sheetInactive again after animation is done loading
    setTimeout(() => {
      if (!isOpen && opened) setOpened(false)
    }, 1000)
  }, [isOpen, opened])

  return (
    <LockBodyScroll
      enabled={isOpen && backdrop}
      bodyClassNameApplied="Modal__Body--open"
      htmlClassNameApplied="Modal__Html--open"
      ref={ref}
    >
      {backdrop && isOpen && (
        <SideSheetBackdrop
          variant={variant}
          zIndex={zIndex}
          onRequestClose={onRequestClose}
          isOpen={isOpen}
          className={isOpen ? 'backdropActive' : 'backdropInactive'}
          backdrop={backdrop}
          backdropEmphasis={backdropEmphasis}
        />
      )}
      <SideSheetStyle
        width={width ? width : '375px'}
        variant={variant}
        largeMobileFullScreen={largeMobileFullScreen}
        smallMobileFullScreen={smallMobileFullScreen}
        isOpen={isOpen}
        zIndex={zIndex}
        className={isOpen ? 'sheetActive' : opened ? 'sheetInactive' : ''}
        alignSideSheet={alignSideSheet}
        {...rest}
      >
        {header && (
          <SideSheetHeader>
            <SideSheetHeadline>{header}</SideSheetHeadline>
            <SideSheetCloseButton onRequestClose={onRequestClose} />
          </SideSheetHeader>
        )}
        {!header && (
          <FlexBox justifyFlexEnd>
            <SideSheetCloseButton onRequestClose={onRequestClose} />
          </FlexBox>
        )}
        {children}
      </SideSheetStyle>
    </LockBodyScroll>
  )
}

export default SideSheet
