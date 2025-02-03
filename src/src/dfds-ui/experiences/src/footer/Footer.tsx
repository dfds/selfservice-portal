import React from 'react'
import { theme, media, useBreakpoint } from '@/dfds-ui/theme/src'
import { Divider } from '@/dfds-ui/react-components/src/divider'
import { FlexBox } from '@/dfds-ui/react-components/src/flexbox'
import { Logo } from '@/dfds-ui/react-components/src/logo'

import { css } from '@emotion/react'
import { FooterMetaLinkProps } from './FooterMetaLink'
import { FooterColumnProps } from './FooterColumn'
import { Grid, GridItem } from '@/dfds-ui/grid'

export type FooterProps = {
  /**
   * Content to be displayed above footer columns
   */
  topElement?: React.ReactNode

  /**
   * Footer columns, if provided, minimum: 1, maximum: 4. Property is optional
   */
  children?: React.ReactElement<FooterColumnProps> | React.ReactElement<FooterColumnProps>[]

  /**
   * Links to be displayed at the bottom right corner
   */
  metaLinks?: React.ReactElement<FooterMetaLinkProps> | React.ReactElement<FooterMetaLinkProps>[]

  /**
   * Content to be display between footer columns and meta links e.g. locale selector, social links.
   */
  features?: React.ReactNode
}

export const Footer: React.FunctionComponent<FooterProps> = ({
  topElement,
  children,
  metaLinks,
  features,
  ...rest
}) => {
  const { lessThan } = useBreakpoint()
  return (
    <footer
      css={css`
        background-color: ${theme.colors.surface.primary};
        width: 100%;
      `}
      {...rest}
    >
      <Divider />
      <Grid>
        <GridItem small={12}>
          <FlexBox
            directionColumn
            css={css`
              margin: 0 auto;
              width: 100%;

              ${media.lessThanEqual('m')`
              padding: 0 ${theme.spacing.s};
            `}
            `}
          >
            {/** Bread crumbs */}
            {topElement && (
              <FlexBox
                justifySpaceBetween
                directionColumn
                css={css`
                  padding: ${topElement || children ? `${theme.spacing.l} 0` : 0};

                  ${media.lessThan('m')`
                    padding: ${topElement || children ? `${theme.spacing.l} 0 0 0` : 0};
                  `}
                `}
              >
                {topElement}
              </FlexBox>
            )}
            {!lessThan('m') && topElement && <Divider />}
            {/** Columns */}
            {children && (
              <FlexBox
                justifySpaceBetween
                directionColumn
                wrapWrap
                css={css`
                  margin-top: 2rem;

                  ${media.greaterThan('m')`
                  flex-direction: row;
                `}
                `}
              >
                {children}
              </FlexBox>
            )}
            {features && (
              <FlexBox
                justifySpaceBetween
                directionColumn
                css={css`
                  padding: ${features || children ? '2.5rem 0 0 0' : 0};

                  ${media.greaterThan('m')`
                    flex-direction: row;
                    flex-wrap: wrap;
                  `}
                `}
              >
                {features}
              </FlexBox>
            )}
            {!lessThan('m') && (features || children) && <Divider />}
            <FlexBox
              justifySpaceBetween
              directionColumn
              css={css`
                margin: 2rem 0 1.5rem 0;

                ${media.greaterThan('m')`
                  margin: 1.5rem 0 1.5rem 0;
                  flex-direction: row;
                  align-items: center;
                `}

                ${media.lessThan('m')`
                  flex-direction: column;
                  align-items: flex-start;
                  /* margin needed so the "cookie button" doesn't cover links */
                  margin-bottom: 4rem;
                `}
              `}
            >
              <Logo
                css={css`
                  height: 2rem;
                `}
              />
              <FlexBox
                itemsFlexStart
                directionColumn
                css={css`
                  margin-top: 1rem;

                  ${media.greaterThan('m')`
                    margin-top: 0;
                    flex-direction: row;
                  `}
                `}
              >
                {metaLinks}
              </FlexBox>
            </FlexBox>
          </FlexBox>
        </GridItem>
      </Grid>
    </footer>
  )
}

export default Footer
