import { useState, useEffect } from 'react'
import defaultBreakpoints from './breakpoints'
import throttle from 'lodash.throttle'
import { css } from '@emotion/react'

type Breakpoint<T> = keyof T | number
type Breakpoints<T> = { [Key in keyof T]: number }
interface IBreakpoints {
  [key: string]: number
}

export function generateMedia<T extends Breakpoints<T>>(breakpoints: T) {
  const toInt = (breakpoint: Breakpoint<T>) => {
    return typeof breakpoint === 'number' ? breakpoint : breakpoints[breakpoint]
  }

  const lessThan =
    (breakpoint: Breakpoint<T>) =>
    (...args: any) =>
      css`
        @media (max-width: ${toInt(breakpoint) - 1}px) {
          ${css(...args)}
        }
      `

  const lessThanEqual =
    (breakpoint: Breakpoint<T>) =>
    (...args: any) =>
      css`
        @media (max-width: ${toInt(breakpoint)}px) {
          ${css(...args)}
        }
      `

  const greaterThan =
    (breakpoint: Breakpoint<T>) =>
    (...args: any) =>
      css`
        @media (min-width: ${toInt(breakpoint) + 1}px) {
          ${css(...args)}
        }
      `

  const between =
    (firstBreakpoint: Breakpoint<T>, secondBreakpoint: Breakpoint<T>) =>
    (...args: any) =>
      css`
        @media (min-width: ${toInt(firstBreakpoint)}px) and (max-width: ${toInt(secondBreakpoint)}px) {
          ${css(...args)}
        }
      `

  return {
    lessThan,
    lt: lessThan,
    lessThanEqual,
    lte: lessThanEqual,
    greaterThan,
    gt: greaterThan,
    between,
    bt: between,
  }
}

export const media = generateMedia(defaultBreakpoints)

export function useBreakpoint(breakpoints: IBreakpoints = defaultBreakpoints) {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)
  useEffect(() => {
    const calcInnerWidth = throttle(() => {
      setWidth(window.innerWidth)
    }, 200)
    window.addEventListener('resize', calcInnerWidth)
    return () => window.removeEventListener('resize', calcInnerWidth)
  }, [])

  const lessThan = (breakpointKey: string) => {
    return breakpoints[breakpointKey] !== undefined && breakpoints[breakpointKey] > width
  }

  const lessThanEqual = (breakpointKey: string) => {
    return breakpoints[breakpointKey] !== undefined && breakpoints[breakpointKey] >= width
  }

  const greaterThan = (breakpointKey: string) => {
    return breakpoints[breakpointKey] !== undefined && breakpoints[breakpointKey] < width
  }

  const between = (lessThanBreakpointKey: string, greaterThanBreakpointKey: string) => {
    return (
      breakpoints[lessThanBreakpointKey] !== undefined &&
      breakpoints[greaterThanBreakpointKey] !== undefined &&
      breakpoints[lessThanBreakpointKey] < width &&
      breakpoints[greaterThanBreakpointKey] > width
    )
  }

  return {
    greaterThan,
    lessThan,
    lessThanEqual,
    between,
    width,
  }
}

export default media
