import React, { useEffect, useState, useRef } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { useResizeObserver } from '@dfds-ui/hooks'
import { IconButton } from '../button'
import useTabsContext from './TabsContext'
import { theme } from '@dfds-ui/theme'
import { ChevronLeft, ChevronRight } from '@dfds-ui/icons/system'

const CHEVRON_SCROLL_STEP = 300

type TabsLabels = {
  scrollLeft: string
  scrollRight: string
}

type TabsProps = {
  tabsLabels?: TabsLabels
  children?: any
}

const StyledTabs = styled.div<{ transparent: boolean | undefined }>`
  display: inline-flex;
  position: relative;
  border-radius: ${theme.radii.l} ${theme.radii.l} 0 0;
  background: ${(p) => (p.transparent ? 'transparent' : theme.colors.surface.primary)};
  overflow: hidden;
  max-width: 100%;
  ::-webkit-scrollbar {
    display: none;
  }
`

const ChevronButton = styled(IconButton)<{
  direction: 'left' | 'right' | undefined
  visible: boolean
  size: 's' | 'm' | undefined
}>`
  height: ${(p) => (p.size === 's' ? '2.75rem' : '3.25rem')};
  width: 1.25rem;
  position: absolute;
  box-sizing: border-box;
  background: ${theme.colors.text.light.secondary};
  color: ${theme.colors.text.primary.primary};
  top: 0;
  bottom: 0;
  border-bottom: 1px solid ${theme.colors.text.primary.disabled};
  display: ${(p) => (p.visible ? 'flex' : 'none')};

  .js-focus-visible & :focus:not([data-focus-visible-added]) {
    border: 0;
    border-bottom: 1px solid ${theme.colors.text.primary.disabled};
  }
  ${(p) =>
    p.direction === 'left'
      ? css`
          left: 0;
          border-radius: ${theme.radii.m} 0 0 0;
        `
      : css`
          right: 0;
          border-radius: 0 ${theme.radii.m} 0 0;
        `}
  z-index: 1;
`

const Tabs: React.FC<TabsProps> = ({
  children,
  tabsLabels = { scrollLeft: 'Scroll tabs left', scrollRight: 'Scroll tabs right' },
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isScrollStart, setIsScrollStart] = useState(false)
  const [isScrollEnd, setIsScrollEnd] = useState(false)
  const [showChevrons, setShowChevrons] = useState(false)

  const { transparent, size } = useTabsContext()

  const { width } = useResizeObserver({ ref })

  const updateScrollControls = ({
    scrollWidth,
    clientWidth,
    scrollLeft,
  }: {
    scrollWidth: number
    clientWidth: number
    scrollLeft: number
  }) => {
    setIsScrollStart(scrollLeft === 0)
    setIsScrollEnd(scrollWidth === clientWidth + scrollLeft)
    setShowChevrons(scrollWidth !== clientWidth)
  }

  const scrollBy = (distance: number) => {
    if (ref.current) {
      if (ref.current.scrollBy === undefined) {
        ref.current.scrollLeft += distance
      } else {
        ref.current.scrollBy({
          top: 0,
          left: distance,
          behavior: 'smooth',
        })
      }
    }
  }
  // TODO: Consider rewrite using ref callback
  useEffect(() => {
    if (ref !== null && ref.current !== null) {
      const node = ref.current
      updateScrollControls(node)

      const handler = () => {
        updateScrollControls(node)
      }

      ref.current.addEventListener('scroll', handler)
      return () => node.removeEventListener('scroll', handler)
    }
    return
  }, [ref, isScrollStart, isScrollEnd, showChevrons, width])

  return (
    <div
      css={css`
        position: relative;
      `}
    >
      {showChevrons && (
        <ChevronButton
          type="button"
          size={size}
          icon={ChevronLeft}
          direction="left"
          disableTooltip
          visible={!isScrollStart}
          ariaLabel={tabsLabels.scrollLeft}
          onClick={() => scrollBy(-CHEVRON_SCROLL_STEP)}
        />
      )}
      {showChevrons && (
        <ChevronButton
          type="button"
          size={size}
          icon={ChevronRight}
          direction="right"
          disableTooltip
          visible={!isScrollEnd}
          ariaLabel={tabsLabels.scrollRight}
          onClick={() => scrollBy(CHEVRON_SCROLL_STEP)}
        />
      )}
      <StyledTabs ref={ref} {...rest} transparent={transparent}>
        {children}
      </StyledTabs>
    </div>
  )
}

export default Tabs
