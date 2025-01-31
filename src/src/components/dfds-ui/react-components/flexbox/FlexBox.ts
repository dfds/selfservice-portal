import styled from '@emotion/styled'
import { decamelize } from 'humps'
import { css } from '@emotion/react'

type RenderAs = {
  /**
   * HTML tag or custom component being rendered
   */
  as?: React.ElementType
}

export type FlexBoxProps = {
  /**
   * Set this prop to `true` to set `display` to `inline-flex` instead of `flex`
   */
  inline?: boolean
  /**
   * Set this prop to `true` to set `flex-direction` to `row-reverse`
   */
  directionRowReverse?: boolean
  /**
   * Set this prop to `true` to set `flex-direction` to `row`
   */
  directionRow?: boolean
  /**
   * Set this prop to `true` to set `flex-direction` to `column`
   */
  directionColumn?: boolean
  /**
   * Set this prop to `true` to set `flex-direction` to `column-reverse`
   */
  directionColumnReverse?: boolean
  /**
   * Set this prop to `true` to set `flex-wrap` to `wrap`
   */
  wrapWrap?: boolean
  /**
   * Set this prop to `true` to set `flex-wrap` to `wrap-reverse`
   */
  wrapWrapReverse?: boolean
  /**
   * Set this prop to `true` to set `align-items` to `flex-start`
   */
  itemsFlexStart?: boolean
  /**
   * Set this prop to `true` to set `align-items` to `flex-end`
   */
  itemsFlexEnd?: boolean
  /**
   * Set this prop to `true` to set `align-items` to `flex-center`
   */
  itemsCenter?: boolean
  /**
   * Set this prop to `true` to set `align-items` to `flex-baseline`
   */
  itemsBaseline?: boolean
  /**
   * Set this prop to `true` to set `align-content` to `flex-start`
   */
  contentFlexStart?: boolean
  /**
   * Set this prop to `true` to set `align-content` to `flex-end`
   */
  contentFlexEnd?: boolean
  /**
   * Set this prop to `true` to set `align-content` to `center`
   */
  contentCenter?: boolean
  /**
   * Set this prop to `true` to set `align-content` to `space-between`
   */
  contentSpaceBetween?: boolean
  /**
   * Set this prop to `true` to set `align-content` to `space-around`
   */
  contentSpaceAround?: boolean
  /**
   * Set this prop to `true` to set `justify-content` to `space-between`
   */
  justifySpaceBetween?: boolean
  /**
   * Set this prop to `true` to set `justify-content` to `space-around`
   */
  justifySpaceAround?: boolean
  /**
   * Set this prop to `true` to set `justify-content` to `flex-end`
   */
  justifyFlexEnd?: boolean
  /**
   * Set this prop to `true` to set `justify-content` to `center`
   */
  justifyCenter?: boolean
  /**
   * Set the `flex` shorthand property
   */
  flex?: number
  gap?: string
}

const getRule = (ruleName: any, defaultRule: any) => (props: any) => {
  const foundRule = Object.keys(props).find((key) => key.startsWith(ruleName))
  if (!foundRule || !props[foundRule]) {
    return defaultRule
  }
  const [, ...rule] = decamelize(foundRule, { separator: '-' }).split('-')
  return rule.join('-')
}

export const FlexBox = styled.div<FlexBoxProps & RenderAs>`
  display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};
  flex-direction: ${getRule('direction', 'row')};
  flex-wrap: ${getRule('wrap', 'nowrap')};
  justify-content: ${getRule('justify', 'flex-start')};
  align-items: ${getRule('items', 'stretch')};
  align-content: ${getRule('content', 'stretch')};
  flex: ${({ flex }) => flex || 'initial'};
  gap: ${({ gap }) => gap || 'initial'};
`
// TODO: Remove duplicated styled declation in this function and in FlexBox. Refactor and test
export function flexBoxStyles(props: FlexBoxProps = {}) {
  return css`
    display: ${props.inline ? 'inline-flex' : 'flex'};
    flex-direction: ${getRule('direction', 'row')(props)};
    flex-wrap: ${getRule('wrap', 'nowrap')(props)};
    justify-content: ${getRule('justify', 'flex-start')(props)};
    align-items: ${getRule('items', 'stretch')(props)};
    align-content: ${getRule('content', 'stretch')(props)};
    flex: ${props.flex || 'initial'};
  `
}

export default FlexBox
