import React from 'react'
import { Global, css } from '@emotion/react'

export type LockBodyScrollProps = {
  /**
   * If `true` scroll locking will be enabled
   */
  enabled?: boolean

  /**
   * ClassName to be applied to the body element when scroll is locked
   */
  bodyClassNameApplied?: string

  /**
   * ClassName to be applied to the html element when scroll is locked
   */
  htmlClassNameApplied?: string

  /**
   * Preserve scroll position when locking.
   */
  preserveScrollPosition?: boolean

  children?: React.ReactNode
}

export type LockBodyScrollResult = {
  getGap(): number
}

const LockBodyScrollComponent = React.forwardRef<LockBodyScrollResult, LockBodyScrollProps>(
  (
    {
      bodyClassNameApplied = 'body-scroll-locked',
      htmlClassNameApplied = 'html-scroll-locked',
      preserveScrollPosition = true,
      children,
    }: LockBodyScrollProps,
    ref
  ) => {
    React.useImperativeHandle(ref, () => ({
      getGap: () => {
        return typeof document === 'undefined'
          ? 0
          : document.body.dataset.lockBodyScrollGap
          ? parseInt(document.body.dataset.lockBodyScrollGap)
          : 0
      },
    }))

    React.useLayoutEffect(() => {
      if (typeof document === 'undefined') return

      const originalTop = window.getComputedStyle(document.body).top //is this really needed ?
      const scrollY = window.scrollY || window.pageYOffset
      if (preserveScrollPosition) {
        document.body.style.top = `${-scrollY}px`
      }
      const bodyWidthBefore = window.getComputedStyle(document.body).width
      document.documentElement.classList.add(htmlClassNameApplied)
      document.body.classList.add(bodyClassNameApplied)
      const bodyWidthAfter = window.getComputedStyle(document.body).width
      const gap = parseInt(bodyWidthAfter) - parseInt(bodyWidthBefore)
      document.body.style.paddingRight = `${gap}px`

      document.body.dataset.lockBodyScrollGap = String(gap)

      return () => {
        const scrollY = document.body.style.top
        document.documentElement.classList.remove(htmlClassNameApplied)
        document.body.classList.remove(bodyClassNameApplied)
        document.body.style.paddingRight = ''
        document.body.style.top = originalTop
        if (preserveScrollPosition) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1)
        }
        delete document.body.dataset.lockBodyScrollGap
      }
    }, [bodyClassNameApplied, htmlClassNameApplied, preserveScrollPosition])
    return (
      <>
        <Global
          styles={css`
            .${htmlClassNameApplied} {
              overflow: hidden;
            }

            .${bodyClassNameApplied} {
              position: fixed;
            }
          `}
        />
        {children}
      </>
    )
  }
)

export const LockBodyScroll = React.forwardRef<LockBodyScrollResult, LockBodyScrollProps>(
  ({ enabled = true, children, ...rest }: LockBodyScrollProps, ref) => {
    return enabled ? (
      <LockBodyScrollComponent {...rest} ref={ref}>
        {children}
      </LockBodyScrollComponent>
    ) : (
      <>{children}</>
    )
  }
)

export default LockBodyScroll
