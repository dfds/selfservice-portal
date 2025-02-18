import React, { useEffect, useRef } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import Tippy, { TippyProps } from '@tippyjs/react'
import { theme } from '@/components/dfds-ui/theme'
import { typography } from '@/components/dfds-ui/typography'
import { FlexBox } from './../flexbox'

type Placement = 'top' | 'right' | 'bottom' | 'left'

type TooltipProps = {
  content: string | React.ReactNode
  name?: string
  placement?: Placement
  offset?: number
  delay?: [number, number] | false
  containerProps?: any
  tabIndex?: number
  visible?: boolean
  onClickOutside?: () => void
  children?: React.ReactNode
}

const { colors, spacing, radii, elevation } = theme

const StyledTippy = styled(Tippy, {
  shouldForwardProp: (prop) => prop !== 'css', // this will prevent warnings emitted from tippy
})`
  background: ${colors.primary.main};
  color: ${colors.text.light.primary};
  padding: ${spacing.xxs} ${spacing.xs};
  ${typography.bodyInterfaceSmall};
  border-radius: ${radii.m};
  box-shadow: ${elevation['4']};

  &[data-state='visible'] {
    opacity: 1;
  }

  &[data-state='hidden'] {
    opacity: 0;
  }
`

const Tooltip: React.FC<TooltipProps> = ({
  name,
  content,
  children,
  delay = [0, 1500],
  placement = 'bottom',
  containerProps,
  tabIndex = 0,
  visible,
  onClickOutside,
}) => {
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>

  useEffect(() => {
    const handleClickOutside = (e: any) =>
      ref.current && !ref.current.contains(e.target) && onClickOutside && onClickOutside()

    visible !== undefined
      ? document.addEventListener('mousedown', handleClickOutside)
      : document.removeEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <span
      id={name}
      css={css`
        width: 100%;
      `}
      ref={ref}
    >
      <StyledTippy content={content} placement={placement} visible={visible} {...(delay !== false && { delay })}>
        <FlexBox
          inline
          as="span"
          tabIndex={tabIndex}
          {...(containerProps || {})}
          {...(containerProps &&
            containerProps.css && {
              css: css`
                ${containerProps.css}
                outline: none;
              `,
            })}
        >
          {children}
        </FlexBox>
      </StyledTippy>
    </span>
  )
}

/**
 * The `UnstableWithTooltip` component can be used to wrap an element with a tooltip but unlike the `Tooltip` component
 * no extra html markup will wrapped around the targeted element.
 *
 * NOTE: It is important that the component being wrapped forwards a ref to the DOM node.
 */
export const UnstableWithTooltip = ({ delay = [0, 1500], ...rest }: { className?: string } & TippyProps) => {
  return (
    <StyledTippy
      // popperOptions={{
      //   modifiers: {
      //     flip: { behavior: ['bottom']}, // force to always display under
      //   },
      // }}
      delay={delay}
      placement="bottom"
      {...rest}
    />
  )
}

export default Tooltip
