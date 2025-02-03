import React from 'react'
import styled from '@emotion/styled'

import allCoreIcons from '@/dfds-ui/react-components/src/core/all-icons'
import allLinksIcons from '@/dfds-ui/react-components/src/links/all-icons'

import { theme } from '@/dfds-ui/theme/src'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const IconContainer = styled.div`
  min-width: 120px;
  text-align: center;
  padding: 8px;
  margin: 8px;
  &:hover {
    background-color: ${theme.colors.surface.secondary};
  }
`

const Icon = styled.div<{ size: string; color: string; secondaryColor: string }>`
  font-size: ${(p) => (p.size ? p.size : undefined)};
  color: ${(p) => (p.color ? p.color : undefined)};
  margin: 8px;
  margin-top: 0;
  > svg {
    fill: ${(p) => (p.secondaryColor ? p.secondaryColor : undefined)};
  }
`

const IconName = styled.div`
  font-size: 0.7rem;
`

const sizeVariations = {
  '1 rem': '1rem',
  '2 rem': '2rem',
  '3 rem': '3rem',
  '4 rem': '4rem',
  '5 rem': '5rem',
  '6 rem': '6rem',
}

const colorVariations = {
  'Text grey': theme.colors.text.dark.primary,
  'Link blue': theme.colors.secondary.main,
  'No red': theme.colors.status.alert,
  'Yes green': theme.colors.status.success,
}

export default {
  title: 'Legacy/Icons',
  argTypes: {
    color: {
      defaultValue: 'Text grey',
      options: ['Text grey', 'Link blue', 'No red', 'Yes green'],
      mapping: colorVariations,
      control: {
        type: 'select',
      },
    },
    secondaryColor: {
      defaultValue: 'Yes green',
      options: ['Text grey', 'Link blue', 'No red', 'Yes green'],
      mapping: colorVariations,
      control: { type: 'select' },
    },
    size: {
      defaultValue: '2 rem',
      options: ['1 rem', '2 rem', '3 rem', '4 rem', '5 rem', '6 rem'],
      mapping: sizeVariations,
      control: { type: 'select' },
    },
  },
}

export const Core = ({ color, secondaryColor, size }: { color: string; secondaryColor: string; size: string }) => (
  <Wrapper>
    {allCoreIcons.map(({ name, component }) => {
      const SvgComponent = component

      return (
        <IconContainer key={name}>
          <Icon color={color} secondaryColor={secondaryColor} size={size}>
            <SvgComponent />
          </Icon>
          <IconName>{name}</IconName>
        </IconContainer>
      )
    })}
  </Wrapper>
)

export const Links = ({ color, secondaryColor, size }: { color: string; secondaryColor: string; size: string }) => (
  <Wrapper>
    {allLinksIcons.map(({ name, component }) => {
      const SvgComponent = component

      return (
        <IconContainer key={name}>
          <Icon color={color} secondaryColor={secondaryColor} size={size}>
            <SvgComponent />
          </Icon>
          <IconName>{name}</IconName>
        </IconContainer>
      )
    })}
  </Wrapper>
)
