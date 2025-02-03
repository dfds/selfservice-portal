/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useCallback, useLayoutEffect, useEffect } from 'react'

export interface DimensionObject {
  width: number
  height: number
  top: number
  left: number
  x: number
  y: number
  right: number
  bottom: number
}

export type UseDimensionsHook = [(node: HTMLElement | null) => void, DimensionObject, HTMLElement | null]

export interface UseDimensionsArgs {
  liveMeasure?: boolean
}

const EMPTY_DIMENSION_OBJECT: DimensionObject = {
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  x: 0,
  y: 0,
  right: 0,
  bottom: 0,
}

function getDimensionObject(node: HTMLElement): DimensionObject {
  const rect = node.getBoundingClientRect()
  /** @ts-ignore */
  const left = 'x' in rect ? rect.x : rect.left
  /** @ts-ignore */
  const top = 'y' in rect ? rect.y : rect.top

  return {
    width: rect.width,
    height: rect.height,
    x: left,
    y: top,
    top: top,
    left: left,
    right: rect.right,
    bottom: rect.bottom,
  }
}

function useDimensions({ liveMeasure = true }: UseDimensionsArgs = {}): UseDimensionsHook {
  const [dimensions, setDimensions] = useState(EMPTY_DIMENSION_OBJECT)
  const [node, setNode] = useState<HTMLElement | null>(null)

  const ref = useCallback((node) => {
    setNode(node)
  }, [])

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

  useIsomorphicLayoutEffect(() => {
    if (node) {
      const measure = () => window.requestAnimationFrame(() => setDimensions(getDimensionObject(node)))
      measure()

      if (liveMeasure) {
        window.addEventListener('resize', measure)
        window.addEventListener('scroll', measure)

        return () => {
          window.removeEventListener('resize', measure)
          window.removeEventListener('scroll', measure)
        }
      }
    }
    return () => {
      /* no-op */
    }
  }, [liveMeasure, node])

  return [ref, dimensions, node]
}

export default useDimensions
