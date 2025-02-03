import React from 'react'
import { SmallHeadline } from '@/dfds-ui/react-components/src'
import {
  ModalHeader,
  ModalDialog,
  ModalBody,
  ModalSizes,
  defaultProps,
  ModalActionsContainer,
  ModalAction,
  ModalCloseButton,
} from '@/dfds-ui/modal/src'
import { Fragment, useState } from 'react'
import { theme } from '@/dfds-ui/theme/src'

export type IEModalProps = React.PropsWithChildren<{
  className?: string
  /**
   * Add heading on the Modal.
   */
  heading?: React.ReactNode
  /**
   * Class name to be added to the header of the Modal.
   */
  headerClassName?: string
  /**
   * Description to be shown a main text in the modal.
   * Placeholders '{Edge}', '{Chrome}' and '{Firefox}' will be replaced with links to download the individual browser.
   */
  description: string
  /**
   * Text to be displayed on the 'Go to front page' button
   */
  goToFrontPageText: string
  /**
   * Text to be displayed on the 'Open page in Microsoft Edge' button
   */
  openPageInEdgeText: string

  /**
   * Add or remove padding inside the Modal.
   */
  noContentPadding?: boolean
  /**
   * Add a z-index prop to modal to specify the stack order.
   */
  zIndex?: number
  /**
   * Display content in a column direction.
   */
  column?: boolean
  /**
   * Sizes (width) of the modal for the different breakpoints.
   * Apart from normal css units a special value of `fullscreen` is also
   * supported.
   * @example
   *  sizes={{ s: 'fullscreen', m: 'fullscreen', l: '80%', xl: '80%', xxl: '80%' }}
   */
  sizes?: ModalSizes
  /**
   * If set to `true` the modal will not be vertically centered.
   * Only applies to larger screensizes
   */
  fixedTopPosition?: boolean
  /**
   * If set to `true` the area around the modal is semi transparent and the close button becomes visible.
   */
  canClose?: boolean
  /**
   * Removes the modal from the default navigation flow and also allows it to receive programmatic focus.
   */
  closeTabIndex?: number
  /**
   * Close the Modal after invoking the provided callback.
   */
  onRequestClose?: () => void
  /**
   * Callback is invoked when IEModal detects the browser is IE.
   */
  onCompatibleBrowserDetected?: () => void
}>

export const IEModal = ({
  heading,
  description,
  goToFrontPageText,
  openPageInEdgeText,
  headerClassName,
  noContentPadding = false,
  column = false,
  zIndex = defaultProps.zIndex,
  sizes = defaultProps.sizes,
  canClose = true,
  closeTabIndex = -1,
  onRequestClose,
  onCompatibleBrowserDetected,
  ...rest
}: IEModalProps) => {
  const [isOpen, setIsOpen] = useState(true)

  const isIE =
    typeof navigator !== 'undefined' &&
    (navigator.userAgent.includes('MSIE ') || navigator.userAgent.includes('Trident/'))
  const isWin10 = typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows NT 10.0')

  if (isIE === false) return null

  if (onCompatibleBrowserDetected) onCompatibleBrowserDetected()

  const bodyContent = description
    .replace('{Edge}', '<a href="https://www.microsoft.com/en-us/edge/">Microsoft Edge</a>')
    .replace('{Chrome}', '<a href="https://www.google.com/chrome/">Chrome</a>')
    .replace('{Firefox}', '<a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>')

  const edgeLink = 'microsoft-edge:' + window.location.href
  const frontPage = window.location.href
    .split('/')
    .filter((_, i) => i < 5)
    .join('/')

  const onClosing = () => {
    if (onRequestClose) onRequestClose()

    setIsOpen(false)
  }

  return (
    <ModalDialog
      backdrop="highEmphasis"
      backdropVariant={canClose ? 'transparent' : 'solid'}
      shouldCloseOnOverlayClick={canClose}
      shouldCloseOnEsc={canClose}
      sizes={sizes}
      isOpen={isOpen}
      onRequestClose={onClosing}
      {...rest}
    >
      <ModalHeader className={headerClassName}>
        <SmallHeadline noMargin>{heading}</SmallHeadline>
        {canClose && <ModalCloseButton onRequestClose={onClosing} tabIndex={closeTabIndex} />}
      </ModalHeader>
      <ModalBody css={{ paddingBottom: 0 }} hasPadding={true} column={column}>
        <div dangerouslySetInnerHTML={{ __html: bodyContent }}></div>
      </ModalBody>
      <ModalActionsContainer
        css={{ marginBottom: theme.spacing.s }}
        actions={
          <Fragment>
            <ModalAction
              css={{ height: '50px' }}
              actionVariation={isWin10 ? 'secondary' : 'primary'}
              onClick={() => (window.location.href = frontPage)}
            >
              {goToFrontPageText}
            </ModalAction>
            {isWin10 && (
              <ModalAction
                css={{ height: '50px' }}
                actionVariation="primary"
                onClick={() => (window.location.href = edgeLink)}
              >
                {openPageInEdgeText}
              </ModalAction>
            )}
          </Fragment>
        }
      />
    </ModalDialog>
  )
}

export default IEModal
