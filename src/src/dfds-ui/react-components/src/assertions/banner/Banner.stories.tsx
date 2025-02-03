import React from 'react'
import { Banner, BannerProps } from './Banner'
import { Story } from '@storybook/react'
import { BannerAction } from './BannerAction'
import { useState } from 'react'
import { BannerHeadline, BannerParagraph } from './BannerTypography'
import { css } from '@emotion/react'

const ArgsTemplate: Story<BannerProps> = (args) => <Banner {...args} />
export const Usage = ArgsTemplate.bind({})

Usage.args = {
  intent: 'info',
  variant: 'lowEmphasis',
  children: 'A Banner gives information or feedback to the user.',
  isNarrow: false,
  actions: [
    <BannerAction key="secondary-action" variation="secondary" onClick={() => alert('Secondary action clicked')}>
      Secondary
    </BannerAction>,
    <BannerAction key="primary-action" variation="primary" onClick={() => alert('Primary action clicked')}>
      Primary
    </BannerAction>,
  ],
  onRequestClose: function () {
    alert('onRequestClose callback called')
  },
}

const disabledControls = ['actions', 'icon'].reduce<Record<string, unknown>>((map, ctrl) => {
  map[ctrl] = { control: false }
  return map
}, {})

Usage.argTypes = {
  intent: {
    options: ['info', 'critical', 'success', 'warning'],
    control: { type: 'radio' },
  },
  isNarrow: {
    defaultValue: false,
    control: { type: 'boolean' },
  },
  variant: {
    options: ['lowEmphasis', 'mediumEmphasis', 'highEmphasis'],
    control: { type: 'radio' },
  },
  stickyPosition: {
    options: ['top', 'bottom', 'bottom-right'],
    control: { type: 'radio' },
  },
  ...disabledControls,
}

export const Typography = () => {
  return (
    <Banner
      variant="mediumEmphasis"
      intent="warning"
      onRequestClose={() => alert('onRequestClose callback called')}
      actions={[
        <BannerAction key="secondary-action" variation="secondary" onClick={() => alert('Secondary action clicked')}>
          Cancel
        </BannerAction>,
        <BannerAction key="primary-action" variation="primary" onClick={() => alert('Primary action clicked')}>
          Yes, delete booking
        </BannerAction>,
      ]}
    >
      <BannerHeadline>Are you sure?</BannerHeadline>
      <BannerParagraph>Deleting your booking will cancel your reservation.</BannerParagraph>
    </Banner>
  )
}

export const ClosingABanner = () => {
  const [isOpen, setIsOpen] = useState(true)
  if (!isOpen) {
    return null
  }
  return (
    <Banner variant="highEmphasis" intent="critical" onRequestClose={() => setIsOpen(false)}>
      Banner with closing functionality
    </Banner>
  )
}

export const StickyTopBanner = () => {
  const [isOpen, setIsOpen] = useState(true)
  if (!isOpen) {
    return null
  }
  return (
    <div
      css={css`
        height: 200vh;
      `}
    >
      <div
        css={css`
          background-color: white;
          height: 64px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        This is dotcom menu
      </div>
      <Banner variant="mediumEmphasis" sticky={true} onRequestClose={() => setIsOpen(false)}>
        Banner that are sticky at top
      </Banner>
    </div>
  )
}

export const StickyBottomBanner = () => {
  const [isOpen, setIsOpen] = useState(true)
  if (!isOpen) {
    return null
  }
  return (
    <div
      css={css`
        height: 300vh;
      `}
    >
      <div
        css={css`
          background-color: white;
          height: 200vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        This is dotcom menu
      </div>
      <Banner variant="mediumEmphasis" sticky={true} stickyPosition="bottom" onRequestClose={() => setIsOpen(false)}>
        Banner that are sticky at bottom
      </Banner>
    </div>
  )
}

export const NarrowBanner = () => {
  const [isOpen, setIsOpen] = useState(true)
  if (!isOpen) {
    return null
  }
  return (
    <div>
      <Banner
        variant="mediumEmphasis"
        isNarrow
        icon={(props: { className?: string }) => <div {...props}>👋</div>}
        actions={[
          <BannerAction
            key="secondary-action"
            variation="secondary-thick"
            onClick={() => alert('Secondary action clicked')}
          >
            Action two
          </BannerAction>,
          <BannerAction key="primary-action" variation="primary-thick" onClick={() => alert('Primary action clicked')}>
            Action one
          </BannerAction>,
        ]}
        onRequestClose={() => setIsOpen(false)}
      >
        Concise message goes here. Example over two lines
      </Banner>
    </div>
  )
}

export const NarrowStickyBanner = () => {
  const [isOpen, setIsOpen] = useState(true)
  if (!isOpen) {
    return null
  }
  return (
    <div
      css={css`
        height: 300vh;
      `}
    >
      <div
        css={css`
          background-color: white;
          height: 200vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        This is dotcom menu
      </div>
      <Banner
        isNarrow
        variant="mediumEmphasis"
        icon={(props: { className?: string }) => <div {...props}>👋</div>}
        sticky={true}
        stickyPosition="bottom-right"
        actions={[
          <BannerAction
            key="secondary-action"
            variation="secondary-thick"
            onClick={() => alert('Secondary action clicked')}
          >
            Action two
          </BannerAction>,
          <BannerAction key="primary-action" variation="primary-thick" onClick={() => alert('Primary action clicked')}>
            Action one
          </BannerAction>,
        ]}
        onRequestClose={() => setIsOpen(false)}
      >
        Concise message goes here. Example over two lines
      </Banner>
    </div>
  )
}
