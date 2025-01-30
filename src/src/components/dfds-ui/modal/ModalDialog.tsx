import React from 'react'
import ReactModal from 'react-modal'
import { css } from '@emotion/react'
import { elevation, LockBodyScroll, LockBodyScrollResult } from '@/components/dfds-ui/react-components'
import { ReactModalWrapper } from './ReactModalWrapper'
import { theme, media } from '@/components/dfds-ui/theme'

export type ModalVariation = 'default' | 'fullscreen' // fullscreen only has an effect on mobile

export type ModalSizes = Record<keyof typeof theme.breakpoints, string>

export type Backdrop = keyof typeof backdropsTransparent

export type BackdropVariant = 'transparent' | 'solid'

export type ModalDialogProps = {
  isOpen: boolean
  onRequestClose?: () => void
  shouldCloseOnOverlayClick?: boolean
  shouldCloseOnEsc?: boolean
  className?: string
  variation?: ModalVariation // *DEPRECATED*
  zIndex?: number
  sizes?: ModalSizes
  fixedTopPosition?: boolean
  renderWhenClosed?: boolean
  backdrop?: Backdrop
  backdropVariant?: BackdropVariant
  children?: React.ReactNode
}

let globalAppElement: HTMLElement | undefined

// To support setting aria-hidden on the app container when showing the Modal react-modal needs to know
// which element to apply the aria attributes on.
export function setGlobalAppElement(selector: string) {
  const el = document.querySelector(selector) as HTMLElement
  globalAppElement = el || undefined
  if (globalAppElement) {
    ReactModal.setAppElement(globalAppElement)
  }
}

const backdropsTransparent = {
  // #FFFFFF  0,7
  lowEmphasis:
    'iVBORw0KGgoAAAANSUhEUgAAACgAAAAoAQMAAAC2MCouAAAAA1BMVEX///+nxBvIAAAAAXRSTlOzEo46UAAAAAtJREFUCNdjGGEAAADwAAFOldjfAAAAAElFTkSuQmCC',
  // #000000 0.25
  mediumEmphasis:
    'iVBORw0KGgoAAAANSUhEUgAAACgAAAAoAQMAAAC2MCouAAAAA1BMVEUAAACnej3aAAAAAXRSTlNANjqZ9gAAAAtJREFUCNdjGGEAAADwAAFOldjfAAAAAElFTkSuQmCC',
  // #002B45 0.7
  highEmphasis:
    'iVBORw0KGgoAAAANSUhEUgAAACgAAAAoAQMAAAC2MCouAAAAA1BMVEUAK0XXvHWsAAAAAXRSTlOzEo46UAAAAAtJREFUCNdjGGEAAADwAAFOldjfAAAAAElFTkSuQmCC',
} as const

const backdropsSolid = {
  lowEmphasis: theme.colors.surface.primary,
  mediumEmphasis: theme.colors.surface.secondary,
  highEmphasis: '#537083', //TODO: hardcoded value - needs to be moved to theme.colors
} as const

// we would like to define this object like this but react-docgen-typescript can not extract the values if we do :(
// defaultProps: Required<Pick< ModalDialogProps, 'sizes' | 'zIndex' | 'renderWhenClosed' | 'overlayBackground'>>
// so we have to cast backdrop to keep ts happy
export const defaultProps = {
  sizes: {
    s: '335px',
    m: '500px',
    l: '500px',
    xl: '500px',
    xxl: '500px',
  },
  zIndex: 9000,
  renderWhenClosed: false,
  backdrop: 'highEmphasis' as Backdrop,
  backdropVariant: 'transparent' as BackdropVariant,
}

const sizeStyles = (size?: string, fixedTopPosition = false) => {
  if (size === 'fullscreen') {
    return css`
      margin: 0;
      width: 100vw;
      min-height: 100vh;
      max-width: 100%;
      &::after {
        display: none;
      }
    `
  } else {
    return css`
      margin: ${fixedTopPosition ? '0' : 'auto'} auto auto auto;
      width: auto;
      min-height: auto;
      min-width: ${size};
      max-width: ${size};
      &::after {
        display: block;
      }
    `
  }
}

const backdropStyles = (
  backdrop: Backdrop = defaultProps.backdrop,
  variant: BackdropVariant = defaultProps.backdropVariant
) => {
  if (variant === 'transparent') {
    return css`
      background-image: url('data:image/png;base64,${backdropsTransparent[backdrop]}');
      background-repeat: repeat;
    `
  } else {
    return css`
      background-color: ${backdropsSolid[backdrop || defaultProps.backdrop]};
    `
  }
}

const modalStyles = ({
  zIndex,
  sizes,
  fixedTopPosition,
  backdrop,
  backdropVariant,
  gap,
}: Partial<ModalDialogProps> & { gap: number }) => {
  return css`
    &__overlay {
      display: flex;
      position: fixed;
      z-index: ${zIndex};
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      align-items: flex-start;
      ${backdropStyles(backdrop, backdropVariant)};
      opacity: 0;
      transition: opacity 200ms;
      overflow: auto;
      overflow-y: ${gap > 0 ? 'scroll' : 'auto'};
      padding-top: 0;
      -webkit-overflow-scrolling: touch;

      ${sizes?.s !== 'fullscreen' &&
      css`
        padding-top: ${theme.spacing.xs};
      `}

      ${sizes?.m !== 'fullscreen' &&
      media.greaterThan('m')`
        padding-top: ${theme.spacing.m};
        align-items: unset;
      `}

      ${sizes?.l !== 'fullscreen' &&
      media.greaterThan('l')`
        padding-top: ${theme.spacing.xl};
        align-items: unset;
      `}

      ${sizes?.xl !== 'fullscreen' &&
      media.greaterThan('xl')`
        padding-top: ${theme.spacing.xl};
        align-items: unset;
      `}

      ${sizes?.xxl !== 'fullscreen' &&
      media.greaterThan('xxl')`
        padding-top: ${theme.spacing.xl};
        align-items: unset;
      `}

      &--after-open {
        opacity: 1;
      }

      &--before-close {
        opacity: 0;
      }
    }

    &__content {
      display: flex;
      flex-direction: column;
      border: 0;
      min-width: 280px;
      max-width: calc(100% - ${theme.spacing.xs} * 2);

      margin: 0 auto;
      ${fixedTopPosition !== undefined &&
      css`
        margin: ${fixedTopPosition ? '0' : 'auto'} auto auto auto;
      `}
      padding: 0;
      background-color: ${theme.colors.surface.primary};
      ${elevation(16)}
      transition-property: transform,opacity;
      transition-duration: 200ms;
      transform: translateY(-20px);
      opacity: 0;

      &::after {
        position: absolute;
        content: '';
        width: 1px;
        clear: both;
        bottom: -${theme.spacing.xs};
        height: ${theme.spacing.xs};
      }

      ${media.greaterThan('m')`
        &::after {
          display: block;
          bottom: -${theme.spacing.m};
          height: ${theme.spacing.m};
        }
      `}

      ${media.greaterThan('l')`
        &::after {
          bottom: -${theme.spacing.xl};
          height: ${theme.spacing.xl};
        }
      `}

      ${media.gt('s')`
        ${
          sizes?.s === 'fullscreen'
            ? sizeStyles(sizes.s)
            : css`
                max-width: ${sizes?.s};
              `
        };
      `}

      ${media.gt('m')`
        ${sizeStyles(sizes?.m, fixedTopPosition)}
      `}

      ${media.gt('l')`
        ${sizeStyles(sizes?.l, fixedTopPosition)}
      `}

      ${media.gt('xl')`
        ${sizeStyles(sizes?.xl, fixedTopPosition)}
      `}

      ${media.gt('xxl')`
        ${sizeStyles(sizes?.xxl, fixedTopPosition)}
      `}

      &--after-open {
        transform: translateY(0);
        opacity: 1;
      }

      &--before-close {
        transform: translateY(-20px);
        opacity: 0;
      }

      &:focus {
        outline: none;
      }
    }
  `
}

const ModalDialog = ({
  isOpen,
  onRequestClose,
  shouldCloseOnOverlayClick = true,
  shouldCloseOnEsc = true,
  variation = 'default',
  zIndex = defaultProps.zIndex,
  className,
  sizes = defaultProps.sizes,
  fixedTopPosition,
  renderWhenClosed = defaultProps.renderWhenClosed,
  backdrop = defaultProps.backdrop,
  backdropVariant = defaultProps.backdropVariant,
  children,
  ...rest
}: ModalDialogProps) => {
  if (variation === 'fullscreen') {
    sizes = { ...sizes, s: 'fullscreen' }
  }

  const overlayRef = React.useRef<HTMLDivElement>()

  const ref = React.useRef<LockBodyScrollResult>(null)
  const [gap, setGap] = React.useState<number>(0)

  React.useEffect(() => {
    setGap(ref.current ? ref.current.getGap() : 0)
  }, [isOpen])

  const touchHandlers = React.useMemo(() => {
    let lastY = 0

    const handleTouchStart = (event: TouchEvent) => {
      lastY = event.touches[0].clientY
    }

    const handleTouchMove = (event: TouchEvent) => {
      const top = event.touches[0].clientY
      const target = event.currentTarget as HTMLDivElement

      const scrollTop = target.scrollTop || 0
      const direction = lastY - top < 0 ? 'up' : 'down'

      if (scrollTop <= 0 && direction == 'up') {
        event.cancelable && event.preventDefault()
      } else if (scrollTop >= target.scrollHeight - target.offsetHeight && direction == 'down') {
        event.cancelable && event.preventDefault()
      }
      lastY = top
    }

    return { handleTouchStart, handleTouchMove }
  }, [])

  const setOverlayRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (overlayRef.current) {
        overlayRef.current.removeEventListener('touchstart', touchHandlers.handleTouchStart)
        overlayRef.current.removeEventListener('touchmove', touchHandlers.handleTouchMove)
      }
      if (node) {
        node.addEventListener('touchstart', touchHandlers.handleTouchStart)
        node.addEventListener('touchmove', touchHandlers.handleTouchMove)
      }

      overlayRef.current = node
    },
    [touchHandlers.handleTouchMove, touchHandlers.handleTouchStart]
  )

  if (!isOpen && !renderWhenClosed) return null

  return (
    <LockBodyScroll
      enabled={isOpen}
      bodyClassNameApplied="Modal__Body--open"
      htmlClassNameApplied="Modal__Html--open"
      ref={ref}
    >
      <ReactModalWrapper
        css={modalStyles({
          zIndex,
          fixedTopPosition,
          sizes: { ...defaultProps.sizes, ...sizes } as ModalSizes,
          backdrop,
          backdropVariant,
          gap,
        })}
        onRequestClose={onRequestClose}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
        shouldCloseOnEsc={shouldCloseOnEsc}
        isOpen={isOpen}
        ariaHideApp={!!globalAppElement}
        className={className}
        overlayRef={setOverlayRef}
        {...rest}
      >
        {isOpen && children}
      </ReactModalWrapper>
    </LockBodyScroll>
  )
}

export default ModalDialog
