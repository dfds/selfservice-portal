import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import { ReactModalWrapper } from './ReactModalWrapper'
import { LockBodyScroll } from '@/dfds-ui/react-components/src'
import { theme } from '@/dfds-ui/theme/src'

export type ModalPanelProps = {
  /**
   * Determines if the modal should be shown or not.
   */
  isOpen: boolean
  /**
   * Determines if pressing esc should close the modal.
   */
  shouldCloseOnEsc?: boolean
  /**
   * Callback when the modal is requested to be closed.
   */
  onRequestClose?: () => void
  /**
   * zIndex for the modal.
   */
  zIndex?: number
  /**
   * className to be assigned to component.
   */
  className?: string
  children?: ReactNode
}

const modalPanelStyles = ({ zIndex }: { zIndex?: number }) => {
  return css`
    &__overlay {
      position: relative;
      z-index: ${zIndex};
    }
  `
}

export const ModalPanel = ({
  isOpen,
  shouldCloseOnEsc,
  onRequestClose,
  zIndex = 9000,
  className,
  children,
}: ModalPanelProps) => {
  return (
    <LockBodyScroll enabled={isOpen}>
      <ReactModalWrapper
        isOpen={isOpen}
        shouldCloseOnEsc={shouldCloseOnEsc}
        onRequestClose={onRequestClose}
        ariaHideApp={false}
        css={modalPanelStyles({ zIndex })}
      >
        <div
          css={css`
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            position: fixed;
            width: 100%;
            display: flex;
            flex-direction: column;
            background-color: ${theme.colors.surface.primary};
            z-index: 1000;
          `}
          className={className}
        >
          {children}
        </div>
      </ReactModalWrapper>
    </LockBodyScroll>
  )
}

export type ModalPanelHeaderProps = {
  /**
   * className to be assigned to component
   */
  className?: string
  children: ReactNode
}

export const ModalPanelHeader = ({ className, children }: ModalPanelHeaderProps) => {
  return (
    <header
      css={css`
        position: relative;
      `}
      className={className}
    >
      {children}
    </header>
  )
}

export type ModalPanelContent = {
  /**
   * className to be assigned to component
   */
  className?: string
  children: ReactNode
}

export const ModalPanelContent = ({ className, children }: ModalPanelContent) => {
  return (
    <section
      css={css`
        display: block;
        position: relative;
        font-size: 14px;
        line-height: 18px;
        font-weight: 400;
        flex: 1 1 auto;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      `}
      className={className}
    >
      {children}
    </section>
  )
}

export type ModalPanelFooterProps = {
  /**
   * className to be assigned to component
   */
  className?: string
  children: ReactNode
}

export const ModalPanelFooter = ({ className, children }: ModalPanelFooterProps) => {
  return (
    <footer
      css={css`
        flex: 0 0 auto;
      `}
      className={className}
    >
      {children}
    </footer>
  )
}
