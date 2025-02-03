import React from 'react'
import { storiesOf } from '@storybook/react'
import { StoryPage, Md, Markdown } from '@/dfds-ui/storybook-design'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { hydro2 } from './colors'

const stories = storiesOf('Hydro Theme/Colors', module)
const colorPalette = hydro2
const ColorBox = ({
  name,
  value,
  isTextColor = false,
  onDarkBg,
}: {
  name: string
  value: string
  isTextColor?: boolean
  onDarkBg?: boolean
}) => {
  return (
    <div
      css={css`
        height: 166px;
        width: 166px;
        display: flex;
        background-color: ${isTextColor ? (onDarkBg ? 'black' : 'white') : value};
        margin-right: 10px;
        margin-bottom: 10px;
        border: 1px solid #eee;
        padding: 1px;
        min-width: 200px;
        justify-content: flex-end;
        align-items: center;
        flex-direction: column;
        position: relative;
      `}
    >
      {isTextColor && (
        <div
          css={css`
            width: 200px;
            height: 125px;
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            top: 0;
            left: 0;
            color: ${value};
            font-weight: bold;
            font-size: 18px;
          `}
        >
          Sample Text
        </div>
      )}
      <div
        css={css`
          font-size: 14px;
          padding: 4px 0;
          text-align: center;
          background-color: white;
          width: 100%;
          font-family: monospace;
        `}
      >
        {name}
      </div>
      <div
        css={css`
          font-size: 12px;
          padding: 4px 0;
          text-align: center;
          background-color: white;
          width: 100%;
        `}
      >
        {value}
      </div>
    </div>
  )
}

const ColorRow = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const { surface, primary, secondary, status, text, divider } = colorPalette

stories.add('Colors', () => (
  <StoryPage>
    {Md`
# Colors

Usage:

\`\`\`js
import { theme } from '@/dfds-ui/theme/src'
const { colors } = theme

const surfacePrimaryColor = colors.surface.primary

\`\`\`

The colors and their names
    `}
    {Object.entries({ surface, primary, secondary, status, divider }).map(([category, colors]) => {
      return (
        <div key={category}>
          <Markdown>{`## ${category.charAt(0).toUpperCase() + category.slice(1)}`}</Markdown>
          <ColorRow>
            {Object.entries(colors).map(([name, value]) => {
              // leave out deprecated colors
              if (category === 'surface' && (name === 'main' || name === 'dark' || name === 'inverted')) {
                return
              }
              return <ColorBox key={`${category}.${name}`} name={`${category}.${name}`} value={value} />
            })}
          </ColorRow>
        </div>
      )
    })}

    <Markdown>{`## Text`}</Markdown>
    <Markdown>{`### Dark`}</Markdown>
    <ColorRow>
      {Object.entries(text.dark).map(([name, value]) => (
        <ColorBox key={name} name={`text.dark.${name}`} value={value} isTextColor />
      ))}
    </ColorRow>

    <Markdown>{`## Text`}</Markdown>
    <Markdown>{`### Light`}</Markdown>
    <ColorRow>
      {Object.entries(text.light).map(([name, value]) => (
        <ColorBox key={name} name={`text.light.${name}`} value={value} isTextColor onDarkBg />
      ))}
    </ColorRow>

    <Markdown>{`## Text`}</Markdown>
    <Markdown>{`### Primary`}</Markdown>
    <ColorRow>
      {Object.entries(text.primary).map(([name, value]) => (
        <ColorBox key={name} name={`text.primary.${name}`} value={value} isTextColor />
      ))}
    </ColorRow>

    <Markdown>{`## Text`}</Markdown>
    <Markdown>{`### Secondary`}</Markdown>
    <ColorRow>
      {Object.entries(text.secondary).map(([name, value]) => (
        <ColorBox key={name} name={`text.secondary.${name}`} value={value} isTextColor />
      ))}
    </ColorRow>
  </StoryPage>
))
