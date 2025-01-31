import React from 'react'
import { css } from '@emotion/react'
import Collapse from 'react-collapse'
import { ChevronDown } from '@/components/dfds-ui/icons/system'
import cx from 'classnames'
import { theme } from '@/components/dfds-ui/theme'
import AccordionContent from './AccordionContent'
import { Divider } from '../divider'
import { Text } from '@/components/dfds-ui/typography'

export type AccordionSmallHeaderProps = {
  /**
   * Add a heading to the Accordion.
   */
  heading: string
  /**
   * Add a secondary heading to the Accordion.
   */
  secondaryHeading?: string
  /**
   * Specify the duration of the transition between open and closed.
   */
  transitionDuration?: string
  /**
   * If set to `true` the Accordion is open.
   */
  isOpen?: boolean
  /**
   * Disable the Accordion.
   */
  disabled?: boolean
  /**
   * Use the Accordion without animation.
   */
  noAnimation?: boolean
  onToggle?: () => void
}

export const AccordionSmallHeader: React.FunctionComponent<AccordionSmallHeaderProps> = ({
  heading,
  onToggle,
  isOpen,
  disabled,
  transitionDuration,
  noAnimation,
}) => {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
      disabled={disabled}
      css={css`
        transition: height ${transitionDuration};
        border: none;
        display: flex;
        align-items: center;
        margin: 0;
        padding: ${theme.spacing.s};
        position: relative;
        width: 100%;
        text-align: left;
        background-color: ${theme.colors.surface.primary};
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        outline: none;
        &:focus:after {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          bottom: 0;
          left: -2px;
          right: -2px;
          border: 2px solid ${theme.colors.secondary.main};
          z-index: 1;
          border-radius: 2px;
        }
        &:focus:not([data-focus-visible-added]):after {
          display: none;
        }
        ${!disabled &&
        css`
          &:hover > svg,
          &:hover > span,
          &:focus-visible > svg,
          &:focus-visible > span {
            transition: 0.1s;
            color: ${theme.colors.text.primary.primary};
          }
        `}

        ${isOpen &&
        !disabled &&
        css`
          svg {
            color: ${theme.colors.secondary.main};
          }

          &:hover > svg,
          &:hover > span {
            transition: 0.1s;
            color: ${theme.colors.text.primary.secondary};
          }
        `}
      `}
      className="accordion__header"
    >
      <Text
        as="span"
        styledAs="actionBold"
        css={css`
          color: ${isOpen ? theme.colors.text.primary.primary : theme.colors.text.primary.secondary};

          /* flex 1 to support IE 11, avoiding space-between  */
          flex: 1;
        `}
      >
        {heading}
      </Text>

      <ChevronDown
        css={css`
          color: ${!disabled ? theme.colors.text.primary.secondary : theme.colors.text.primary.disabled};
          width: ${theme.spacing.m};
          height: ${theme.spacing.m};
          transition: ${noAnimation ? '' : `transform ${transitionDuration} cubic-bezier(0, 1, 0, 1)`};
          transform: rotate(${isOpen ? '.5turn' : '0'});
        `}
      />
    </button>
  )
}

export type AccordionSmallProps = {
  /**
   * Add a heading to the Accordion.
   */
  heading: string
  /**
   * Specify the duration of the transition between open and closed.
   */
  transitionDuration?: string
  /**
   * If set to `true` the Accordion is open.
   */
  isOpen?: boolean
  /**
   * Disable the Accordion.
   */
  disabled?: boolean
  /**
   * Use the Accordion without animation.
   */
  noAnimation?: boolean
  onToggle?: () => void
  // eslint-disable-next-line @typescript-eslint/ban-types
  collapseProps?: object
}

export const AccordionSmall: React.FunctionComponent<AccordionSmallProps> = ({
  children,
  isOpen,
  disabled,
  heading,
  transitionDuration = '260ms',
  onToggle,
  collapseProps,
  noAnimation,
  ...rest
}) => {
  return (
    <>
      <div className={cx('accordion-small', 'js-focus-visible')} {...rest}>
        <AccordionSmallHeader {...{ heading, onToggle, isOpen, disabled, transitionDuration, noAnimation }} />
        <Collapse
          className="accordion-css-transition"
          style={{ transitionDuration }}
          isOpen={isOpen}
          aria-hidden={isOpen ? 'false' : 'true'}
          noAnim={noAnimation}
          {...collapseProps}
        >
          <AccordionContent type="small">{children}</AccordionContent>
        </Collapse>
      </div>
      <Divider
        css={css`
          &:last-of-type {
            display: none;
          }
        `}
      />
    </>
  )
}

export default AccordionSmall
