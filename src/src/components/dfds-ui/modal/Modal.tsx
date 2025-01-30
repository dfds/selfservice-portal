import React from 'react'
import ModalHeader from './ModalHeader'
import ModalCloseButton from './ModalCloseButton'
import ModalDialog, { ModalSizes, defaultProps, ModalVariation, Backdrop, BackdropVariant } from './ModalDialog'
import ModalBody from './ModalBody'
import ModalActionsContainer from './ModalActionsContainer'
import ModalHeadline from './ModalHeadline'

export type ModalProps = React.PropsWithChildren<{
  /**
   * If set to `true` the modal is shown
   */
  isOpen: boolean
  /**
   * Close the Modal after invoking the provided callback.
   */
  onRequestClose?: () => void
  /**
   * Modal closes on overlay click.
   */
  shouldCloseOnOverlayClick?: boolean
  /**
   * Modal closes on ESC key.
   */
  shouldCloseOnEsc?: boolean
  /**
   * Gives the user the possibility to close the Modal.
   */
  showClose?: boolean
  /**
   * Class name to be added to the Modal.
   */
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
   * *DEPRECATED* use `sizes` instead.
   *
   * Fullscreen only has an effect on mobile.
   */
  variation?: ModalVariation
  /**
   * Add or remove padding inside the Modal.
   */
  noContentPadding?: boolean
  /**
   * Add a z-index prop to modal to specify the stack order.
   */
  zIndex?: number
  /**
   * Removes the modal from the default navigation flow and also allows it to receive programmatic focus.
   */
  closeTabIndex?: number
  /**
   * Specifies the ariaLabel to be added to the close(x) button
   */
  closeLabel?: string
  /**
   * Display content in a column direction.
   */
  column?: boolean
  /**
   * Actions to be displayed inside the Modal.
   */
  actions?: React.ReactNode
  /**
   * Sizes (width) of the modal for the different breakpoints.
   * Apart from normal css units a special value of `fullscreen` is also
   * supported.
   * @example
   *  sizes={{ s: 'fullscreen', m: 'fullscreen', l: '80%', xl: '80%', xxl: '80%' }}
   */
  sizes?: ModalSizes

  /**
   * If set to `true` the modal will no be vertical centered.
   * When not specified the modal will be fixed for small devices but centered when larger.
   */
  fixedTopPosition?: boolean

  /**
   * If `true` the modal will render even if not open.
   */
  renderWhenClosed?: boolean

  /**
   * Overlay backdrop
   */
  backdrop?: Backdrop

  /**
   * Overlay variant. Either transparent or solid.
   */
  backdropVariant?: BackdropVariant
}>

export const Modal = ({
  showClose = true,
  heading,
  headerClassName,
  noContentPadding = false,
  onRequestClose,
  children,
  closeTabIndex = -1,
  closeLabel = 'Close',
  column = false,
  zIndex = defaultProps.zIndex,
  sizes = defaultProps.sizes,
  renderWhenClosed = defaultProps.renderWhenClosed,
  backdrop = defaultProps.backdrop,
  backdropVariant = defaultProps.backdropVariant,
  actions,
  ...rest
}: ModalProps) => {
  const showHeader = heading !== undefined || showClose
  return (
    <ModalDialog
      onRequestClose={onRequestClose}
      sizes={sizes}
      renderWhenClosed={renderWhenClosed}
      backdrop={backdrop}
      backdropVariant={backdropVariant}
      {...rest}
    >
      {showHeader && (
        <ModalHeader className={headerClassName}>
          <ModalHeadline>{heading}</ModalHeadline>
          {showClose && (
            <ModalCloseButton onRequestClose={onRequestClose} tabIndex={closeTabIndex} closeLabel={closeLabel} />
          )}
        </ModalHeader>
      )}
      <ModalBody hasPadding={!noContentPadding} column={column}>
        {children}
      </ModalBody>
      <ModalActionsContainer actions={actions} />
    </ModalDialog>
  )
}

export default Modal
