import React from 'react'
import { css, keyframes } from '@emotion/react'
import { Ship, Waves } from '@/components/dfds-ui/icons'
import { Text } from '@/components/dfds-ui/typography'
import { media, theme } from '@/components/dfds-ui/theme'
import { FlexBox } from '../flexbox'
import LockBodyScroll from '../common/LockBodyScroll'

const sail = keyframes`
  to {
    transform: translateY(-3px);
  }
`

const wave = keyframes`
  to {
    transform: translateX(-30px);
  }
`

interface Props {
  label?: string
  showMenu?: boolean
  iconColor?: string
  waveColor?: string
}

const DfdsLoader: React.FC<Props> = ({ label, iconColor, waveColor, showMenu }) => {
  return (
    <LockBodyScroll enabled={true} bodyClassNameApplied="Modal__Body--open" htmlClassNameApplied="Modal__Html--open">
      <div
        css={css`
          padding-left: calc(100vw - 100%);
          background-color: ${theme.colors.surface.secondary};
          position: fixed;
          left: 0;
          right: 0;
          top: ${showMenu ? '60px' : '0'};
          bottom: 0;
          z-index: 4999;

          ${media.lessThanEqual(1218)`
            top: ${showMenu ? '48px' : '0'};
         `}
        `}
      >
        <FlexBox
          directionColumn
          justifyCenter
          itemsCenter
          css={css`
            height: 100%;
          `}
        >
          <FlexBox>
            <Ship
              css={css`
                width: 70px;
                height: 70px;
                color: ${iconColor ?? theme.colors.primary.main};
                z-index: 5000;
                animation: ${sail} 0.58s ease-in-out alternate infinite;
              `}
            />
            <Waves
              css={css`
                top: 50%;
                left: 50%;
                width: 146px;
                height: 20px;
                color: ${waveColor ?? theme.colors.surface.secondary};
                position: fixed;
                z-index: 5001;
                margin-left: -73px;
                margin-top: 13px;
                margin-top: ${label && showMenu && '20px'};
                margin-top: ${label && !showMenu && '-10px'};
                margin-top: ${!label && showMenu && '42px'};
                animation: ${wave} 0.8s linear infinite;

                ${media.lessThanEqual(1218)`
                  margin-top: 13px;
                  margin-top: ${label && showMenu && '12px'};
                  margin-top: ${label && !showMenu && '-10px'};
                  margin-top: ${!label && showMenu && '35px'};
                `}
              `}
            />
          </FlexBox>
          {label && (
            <Text
              css={css`
                margin-top: ${theme.spacing.m};
              `}
              as="div"
              styledAs="label"
            >
              {label}
            </Text>
          )}
        </FlexBox>
      </div>
    </LockBodyScroll>
  )
}

export default DfdsLoader
