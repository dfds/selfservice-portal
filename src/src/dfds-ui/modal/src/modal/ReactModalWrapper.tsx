import React from 'react'
import ReactModal from 'react-modal'

export type ReactModalWrapperProps = ReactModal.Props & {
  className?: string
  children?: React.ReactNode
}

export const ReactModalWrapper = ({ className, ...rest }: ReactModalWrapperProps) => {
  const classArr = className ? className.split(' ') : ['__modal']
  const append = (str: string) => classArr.join(str + ' ') + str

  return (
    <ReactModal
      closeTimeoutMS={200}
      className={{
        base: append('__content'),
        afterOpen: append('__content--after-open'),
        beforeClose: append('__content--before-close'),
      }}
      portalClassName={append('')}
      overlayClassName={{
        base: append('__overlay '),
        afterOpen: append('__overlay--after-open'),
        beforeClose: append('__overlay--before-close'),
      }}
      {...rest}
    />
  )
}
