import React from 'react'
import styled from '@emotion/styled'

import allSystemIcons from '@/components/dfds-ui/icons/system/all-icons'
import allPaxIcons from '@/components/dfds-ui/icons/pax/all-icons'
import allFlagIcons from '@/components/dfds-ui/icons/flags/all-icons'
import allTransportIcons from '@/components/dfds-ui/icons/transport/all-icons'
import allPaymentIcons from '@/components/dfds-ui/icons/payment/all-icons'
import allSocialMediaIcons from '@/components/dfds-ui/icons/social-media/all-icons'
import allLogisticsIcons from '@/components/dfds-ui/icons/logistics/all-icons'

import { theme } from '@/components/dfds-ui/theme'

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
  display: flex;
  justify-content: center;
  > svg {
    fill: ${(p) => (p.secondaryColor ? p.secondaryColor : undefined)};
  }
`

const IconName = styled.div`
  font-size: 0.7rem;
`

const sizeVariations = {
  '1 rem': '1rem',
  '1.5 rem': '1.5rem',
  '2 rem': '2rem',
  '3 rem': '3rem',
  '4 rem': '4rem',
  '5 rem': '5rem',
  '6 rem': '6rem',
}

const colorVariations = {
  'Dark text': theme.colors.text.dark.primary,
  'Secondary text': theme.colors.text.secondary.primary,
  Alert: theme.colors.status.alert,
  Success: theme.colors.status.success,
}

export default {
  title: 'Icons/Icons',
  argTypes: {
    color: {
      defaultValue: 'Dark text',
      options: ['Dark text', 'Secondary text', 'Alert', 'Success'],
      mapping: colorVariations,
      control: {
        type: 'select',
      },
    },
    secondaryColor: {
      defaultValue: 'Success',
      options: ['Dark text', 'Secondary text', 'Alert', 'Success'],
      mapping: colorVariations,
      control: { type: 'select' },
    },
    size: {
      defaultValue: '2 rem',
      options: ['1 rem', '1.5 rem', '2 rem', '3 rem', '4 rem', '5 rem', '6 rem'],
      mapping: sizeVariations,
      control: { type: 'select' },
    },
  },
}

export const System = ({ color, secondaryColor, size }: { color: string; secondaryColor: string; size: string }) => (
  <Wrapper>
    {allSystemIcons.map(({ name, component }) => {
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

export const Passenger = ({ color, secondaryColor, size }: { color: string; secondaryColor: string; size: string }) => (
  <Wrapper>
    {allPaxIcons.map(({ name, component }) => {
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

export const Transport = ({ color, secondaryColor, size }: { color: string; secondaryColor: string; size: string }) => (
  <Wrapper>
    {allTransportIcons.map(({ name, component }) => {
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

export const Payment = ({ color, secondaryColor, size }: { color: string; secondaryColor: string; size: string }) => (
  <Wrapper>
    {allPaymentIcons.map(({ name, component }) => {
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

export const Logistics = ({ color, secondaryColor, size }: { color: string; secondaryColor: string; size: string }) => (
  <Wrapper>
    {allLogisticsIcons.map(({ name, component }) => {
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

export const Flags = ({ color, secondaryColor, size }: { color: string; secondaryColor: string; size: string }) => (
  <Wrapper>
    {allFlagIcons.map(({ name, component }) => {
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

export const SocialMedia = ({
  color,
  secondaryColor,
  size,
}: {
  color: string
  secondaryColor: string
  size: string
}) => (
  <Wrapper>
    {allSocialMediaIcons.map(({ name, component }) => {
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
