import React, { ReactNode } from 'react'
import { css } from '@emotion/react'
import Collapse, { CollapseProps } from '@kunukn/react-collapse'
import { ChevronDown } from '@/dfds-ui/icons/src/system'
import cx from 'classnames'
import AccordionContent from './AccordionContent'
import { theme } from '@/dfds-ui/theme/src'
import { Divider } from '../divider'
import { Text } from '@/dfds-ui/typography/src'
import { FlexBox } from '../flexbox'

export type AccordionHeaderProps = {
  /**
   * Add heading to the Accordion.
   */
  heading?: string
  /**
   * Add secondary heading to the Accordion.
   */
  secondaryHeading?: ReactNode
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
  /**
   * Hide the secondary heading when the Accordion is opened.
   */
  noSecondaryHeadingWhenOpen?: boolean
  /**
   * Callback when toggling the accordion
   */
  onToggle?: () => void
}

export const AccordionHeader: React.FunctionComponent<AccordionHeaderProps> = ({
  heading,
  secondaryHeading,
  onToggle,
  isOpen,
  disabled,
  transitionDuration,
  noAnimation,
  noSecondaryHeadingWhenOpen,
}) => {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={disabled ? () => undefined : onToggle}
      disabled={disabled}
      css={css`
        border: none;
        display: flex;
        width: 100%;
        align-items: center;
        margin: 0;
        padding: ${theme.spacing.s};
        position: relative;
        text-align: left;
        background-color: ${theme.colors.surface.primary};
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        outline: none;

        &:focus:after {
          content: '';
          display: block;
          position: absolute;
          top: 0px;
          bottom: 0px;
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
          &:hover > div > div > span:first-of-type,
          &:focus-visible > svg,
          &:focus-visible > div > div > span:first-of-type {
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
          &:hover > div > div > span:first-of-type {
            transition: 0.1s;
            color: ${theme.colors.text.primary.secondary};
          }
        `}
        ${disabled &&
        css`
          div > span:first-of-type {
            color: ${theme.colors.text.primary.disabled};
          }
        `}
      `}
      className="accordion__header"
    >
      <div
        /* flex 1 to support IE 11, avoiding space-between  */
        css={css`
          flex: 1;
        `}
      >
        <FlexBox directionColumn>
          <Text
            as="span"
            styledAs={'actionBold'}
            css={css`
              color: ${isOpen ? theme.colors.text.primary.primary : theme.colors.text.primary.secondary};
            `}
          >
            {heading}
          </Text>
          {secondaryHeading && (
            <Text
              as="span"
              styledAs="bodyInterface"
              css={css`
                visibility: ${isOpen && noSecondaryHeadingWhenOpen ? 'hidden' : ''};
                transition: visibility 0.1s;
                margin-top: ${theme.spacing.xs};
                color: ${theme.colors.text.primary.secondary};
              `}
            >
              {secondaryHeading}
            </Text>
          )}
        </FlexBox>
      </div>

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

export type AccordionProps = {
  /**
   * Add heading to the Accordion.
   */
  heading?: string
  /**
   * Add a custom header to the Accordion.
   */
  header?: ReactNode
  /**
   * Add secondary heading to the Accordion.
   */
  secondaryHeading?: ReactNode
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
   * Callback when toggling the accordion
   */
  onToggle?: () => void
  /**
   * Props passed on to the Collapse component
   */
  collapseProps?: CollapseProps
  /**
   * Use the Accordion without animation.
   */
  noAnimation?: boolean
  /**
   * The compressed variant removes the `margin-bottom` of the Accordion.
   */
  variant?: 'default' | 'compressed'
  /**
   * Specify the content padding of the Accordion.
   */
  type?: 'small' | 'medium'
  /**
   * Add a className to the Accordion.
   */
  className?: string
  /**
   * Hide the secondary heading when the Accordion is opened.
   */
  noSecondaryHeadingWhenOpen?: boolean
  /**
   * Hide the Divider (the grey line under the header)
   */
  hideDivider?: boolean
  /**
   * Updates component with children prop accordingly to the @types update
   */
  children?: ReactNode
}

export const Accordion: React.FunctionComponent<AccordionProps> = ({
  children,
  isOpen,
  header,
  disabled,
  heading,
  secondaryHeading,
  transitionDuration = '260ms',
  onToggle,
  collapseProps = { overflowOnExpanded: true },
  noAnimation,
  variant,
  className,
  type,
  noSecondaryHeadingWhenOpen,
  hideDivider,
  ...rest
}) => {
  return (
    <div
      className={cx(
        'accordion',
        {
          'accordion--is-open': isOpen,
          'accordion--is-closed': !isOpen,
        },
        className
      )}
      css={css`
        position: relative;
        transition: ${noAnimation ? '' : `margin-top ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1)`};

        &.accordion--is-closed + &.accordion--is-open {
          margin-top: 8px;
        }

        &:last-of-type .accordion__content {
          margin-bottom: 0;
        }

        /* Overwrite padding on header and content for neested nested AccordionSmall */
        & .accordion-small .accordion__content,
        & .accordion-small .accordion__header {
          padding-left: 0;
          padding-right: 0;
        }
      `}
      {...rest}
    >
      {!header && (
        <>
          <AccordionHeader
            {...{
              heading,
              secondaryHeading,
              onToggle,
              isOpen,
              disabled,
              transitionDuration,
              noAnimation,
              noSecondaryHeadingWhenOpen,
            }}
          />
          {!hideDivider && (
            <Divider
              css={css`
                margin-left: ${theme.spacing.s};
                margin-right: ${theme.spacing.s};
                display: ${isOpen ? 'none' : 'block'};
              `}
            />
          )}
        </>
      )}
      {!heading && header && <div>{header}</div>}

      <Collapse
        className="accordion-css-transition"
        style={{ transitionDuration }}
        css={css`
          transition: height ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1);
        `}
        isOpen={isOpen}
        aria-hidden={isOpen ? 'false' : 'true'}
        noAnim={noAnimation}
        {...collapseProps}
      >
        <AccordionContent variant={variant ? variant : 'default'} type={type}>
          {children}
        </AccordionContent>
      </Collapse>
    </div>
  )
}

export default Accordion
