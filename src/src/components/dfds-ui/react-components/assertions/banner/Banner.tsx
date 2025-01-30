import React, { createContext, ElementType, FunctionComponent, ReactNode, useContext, useRef, useState } from 'react'
import { css } from '@emotion/react'
import { useResizeObserver } from '@dfds-ui/hooks'
import { Intent, getIntentColor } from '../../common/intent'
import { Information, StatusAlert, StatusSuccess, StatusWarning, Close } from '@dfds-ui/icons/system'
import { IconButton, IconButtonProps } from '../../button'
import { Divider } from '../../divider'
import { theme } from '@dfds-ui/theme'
import { typography } from '@dfds-ui/typography'

export type BannerVariant = 'lowEmphasis' | 'mediumEmphasis' | 'highEmphasis' | 'default' | 'inverted'

export type BannerStickyPosition = 'top' | 'bottom' | 'bottom-right'

export type BannerProps = {
  /**
   * Specifies the intent of the Banner (change the color of the banner icon to match intended status)
   */
  intent?: Intent

  /**
   * Actions to be displayed inside the banner
   */
  actions?: ReactNode

  /**
   * Class name to be added to the banner
   */
  className?: string

  /**
   * Add a close icon in the top-right corner which will invoke the provided callback
   */
  onRequestClose?: () => void

  /**
   * Specifies the ariaLabel to be added to the close(x) button
   */
  closeLabel?: string

  /**
   * Specifies the variation of the banner.
   *
   * `default` and `inverted` variants are deprecated
   */
  variant?: BannerVariant

  /**
   * Specifies if the Banner should be displayed with `position: fixed;`
   *
   * When the value is `undefined` the Banner default to being sticky if `variant` is set to `inverted`
   */
  sticky?: boolean

  /**
   * Specifies the position of the Sticky Banner.
   */
  stickyPosition?: BannerStickyPosition

  /**
   * Specifies if the Banner should have a border/divider at the bottom.
   */
  divider?: boolean

  /**
   * Specify a custom icon to replace the one derived from `intent`
   *
   * @type {ElementType<{ className?: string }>}
   */
  icon?: ElementType<{ className?: string }>

  /**
   * Specifies if the actions should always appear below the content
   */
  wrapActions?: boolean

  /**
   * Content of the Banner
   */
  children?: ReactNode

  /**
   * Specifies if the banner should be narrow
   */
  isNarrow?: boolean
}

function normalizeIntent(intent: Intent) {
  // for intent none we will use info instead
  return intent === 'none' ? 'info' : intent
}

function normalizeVariant(variant: BannerVariant) {
  // for variant default we will use lowEmphasis. For variant inverted we will use highEmphasis
  return variant === 'default' ? 'lowEmphasis' : variant === 'inverted' ? 'highEmphasis' : variant
}

type BannerColors = {
  background: string
  foreground: string
  icon: string
  close: string
  closeHover: string
}

function getColors(variant: BannerVariant, intent: Intent): BannerColors {
  variant = normalizeVariant(variant)
  intent = normalizeIntent(intent)
  switch (variant) {
    case 'lowEmphasis':
      return {
        background: theme.colors.surface.primary,
        foreground: intent === 'critical' ? getIntentColor('critical') : theme.colors.text.dark.primary,
        icon: getIntentColor(intent),
        close: '',
        closeHover: '',
      }
    case 'mediumEmphasis':
      return {
        background: getIntentColor(intent, true),
        foreground: theme.colors.text.primary.primary,
        icon: theme.colors.text.primary.primary,
        close: '',
        closeHover: '',
      }
    case 'highEmphasis':
      return {
        background: getIntentColor(intent),
        foreground: theme.colors.text.light.primary,
        icon: theme.colors.text.light.primary,
        close: theme.colors.text.light.secondary,
        closeHover: theme.colors.text.light.primary,
      }
  }
}

function stickyStyles(stickyPosition?: BannerStickyPosition) {
  const commonStyles = css`
    position: sticky;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 400;
  `

  if (stickyPosition === 'top') {
    return css`
      ${commonStyles};
      top: 0;
    `
  }
  if (stickyPosition === 'bottom-right') {
    return css`
      ${commonStyles};
      bottom: 0;
      margin-left: auto;
    `
  }
  return css`
    ${commonStyles};
    bottom: 0;
  `
}

function bannerStyles({
  isNarrow,
  variant,
  intent,
  sticky,
  stickyPosition,
  wrapActions,
  contentWrapped,
  actionsWrapped,
  hasDismissButton,
}: {
  isNarrow: boolean
  variant: BannerVariant
  intent: Intent
  sticky: boolean
  stickyPosition?: BannerStickyPosition
  wrapActions: boolean
  contentWrapped: boolean
  actionsWrapped: boolean
  hasDismissButton: boolean
}) {
  const colors = getColors(variant, intent)
  return css`
    display: flex;
    align-items: center;
    background-color: ${colors.background};
    position: relative;
    ${sticky && stickyStyles(stickyPosition)};
    min-height: 64px;
    padding: ${isNarrow ? '16px' : '10px 16px 0 16px'};
    max-width: ${isNarrow ? '375px' : '100%'};

    .BannerInner {
      ${typography.bodyInterface};
      display: flex;
      align-items: center;
      flex-grow: 1;
      flex-wrap: wrap;
      text-align: left;
    }

    .IconComponent {
      color: ${colors.icon};
      height: ${isNarrow ? theme.spacing.m : theme.spacing.l};
      min-width: ${isNarrow ? theme.spacing.m : theme.spacing.l};
      margin-right: ${isNarrow ? theme.spacing.xs : theme.spacing.s};
      font-size: 20px;
      flex: 0;
      align-self: ${contentWrapped ? 'flex-start' : 'center'};
    }

    .BannerCloseButtonWrapper {
      position: absolute;
      top: ${contentWrapped ? (isNarrow ? '6px' : '0') : '10px'};
      right: ${contentWrapped ? (isNarrow ? '6px' : '0') : '2px'};
    }

    .BannerCloseButton {
      color: ${colors.close};
      &:hover {
        color: ${colors.close};
      }
    }

    .BannerContent {
      color: ${colors.foreground};
      display: flex;
      align-items: center;
      margin: 0 0 10px 0;
      margin-right: ${hasDismissButton && actionsWrapped && '2rem'};
    }

    .BannerActions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      flex-grow: 1;
      margin: ${!isNarrow && '0 0 10px 0'};
      flex-basis: ${wrapActions && '100%'};
      margin-top: ${actionsWrapped && '0.25rem'};
      margin-right: ${hasDismissButton && !actionsWrapped && '2rem'};
    }
  `
}

const IntentIcon = ({ intent, icon }: { intent: Intent; icon?: BannerProps['icon'] }) => {
  let IconComponent: BannerProps['icon']
  if (icon) {
    IconComponent = icon
  } else {
    if (intent === 'success') IconComponent = StatusSuccess
    else if (intent === 'critical') IconComponent = StatusAlert
    else if (intent === 'warning') IconComponent = StatusWarning
    else if (intent === 'info') IconComponent = Information
    else IconComponent = Information
  }
  return <IconComponent className="IconComponent" />
}

const BannerCloseButton = ({ ...props }: Partial<IconButtonProps>) => {
  return (
    <div className="BannerCloseButtonWrapper">
      <IconButton
        className="BannerCloseButton"
        disableOverlay
        hoverColor={theme.colors.text.dark.primary}
        size="medium"
        icon={Close}
        ariaLabel="Close"
        type="button"
        css={css`
          color: ${theme.colors.text.dark.secondary};
          max-height: 2.75rem; /* TODO: Need for IOS: Consider formalizing this in IconButton */
          max-width: 2.75rem;
        `}
        data-testid="banner-close"
        {...props}
      />
    </div>
  )
}
interface BannerContextInterface {
  intent: NonNullable<BannerProps['intent']>
  variant: NonNullable<BannerProps['variant']>
}

export const BannerContext = createContext<BannerContextInterface | undefined>(undefined)

export const useBannerContext = (): BannerContextInterface => {
  const ctx = useContext(BannerContext)
  if (ctx === undefined) {
    throw new Error('useBannerContext must be used within BannerAction component.')
  }

  return ctx
}

export const Banner: FunctionComponent<BannerProps> = ({
  isNarrow = false,
  intent = 'info',
  actions,
  onRequestClose,
  closeLabel = 'Close',
  children,
  variant: variantProp,
  sticky: stickyProp,
  stickyPosition: stickyPositionProp,
  divider = false,
  wrapActions = false,
  icon,
  ...rest
}) => {
  const variant = !variantProp ? 'default' : variantProp
  const sticky = stickyProp === undefined ? variant === 'inverted' : !!stickyProp
  const stickyPosition = !stickyPositionProp && sticky ? 'top' : stickyPositionProp
  // Indicates if the banner is has a height above WRAPPED_HEIGHT_THRESHOLD
  const [contentWrapped, setContentWrapped] = useState(false)
  // Indicates if the BannerActions was wrapped below the BannerContent
  const [actionsWrapped, setActionsWrapped] = useState(true)

  // we cannot detect if flex items has wrapped (eg. actions wrapped below the content) so we detect that using a
  // resize-observer hook so we can align the actions correctly when displayed below the close button.
  const WRAPPED_HEIGHT_THRESHOLD = 64
  const ref = useRef<HTMLDivElement>(null)
  useResizeObserver({
    ref: ref,
    onResize: ({ height }) => {
      const wrapDetected = height !== undefined && height > WRAPPED_HEIGHT_THRESHOLD
      const actions = ref.current?.getElementsByClassName('BannerActions')[0]
      const content = ref.current?.getElementsByClassName('BannerContent')[0]

      if (wrapDetected !== contentWrapped) {
        setContentWrapped(wrapDetected)
      }

      if (actions && content) {
        const actionsWrapDetected =
          (actions as HTMLElement).offsetTop >
          (content as HTMLElement).offsetTop + (content as HTMLElement).offsetHeight
        if (actionsWrapDetected !== actionsWrapped) {
          setActionsWrapped(actionsWrapDetected)
        }
      }
    },
  })

  if (__DEV__) {
    if (variant === 'default' || variant === 'inverted') {
      // eslint-disable-next-line no-console
      console.warn('The default and inverted variants are deprecated')
    }
  }

  const handleClose = () => onRequestClose && onRequestClose()

  return (
    <BannerContext.Provider value={{ intent, variant }}>
      <div
        css={bannerStyles({
          isNarrow,
          variant,
          intent,
          sticky,
          stickyPosition,
          wrapActions,
          contentWrapped,
          actionsWrapped,
          hasDismissButton: !!onRequestClose,
        })}
        {...rest}
        ref={ref}
      >
        <div className="BannerInner">
          <div className="BannerContent">
            <IntentIcon intent={intent} icon={icon} />
            <div>{children}</div>
          </div>
          {actions && <div className="BannerActions">{actions}</div>}
        </div>
        {onRequestClose && <BannerCloseButton ariaLabel={closeLabel} onClick={handleClose} />}
        {divider && (
          <Divider
            css={css`
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
            `}
          />
        )}
      </div>
    </BannerContext.Provider>
  )
}

export default Banner
