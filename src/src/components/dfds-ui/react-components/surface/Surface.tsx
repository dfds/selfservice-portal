import React, { Fragment } from 'react'
import { theme } from '@/components/dfds-ui/theme'
import { css } from '@emotion/react'

export type SurfaceType = keyof typeof theme.colors.surface

export type SurfaceContextType = {
  surface: SurfaceType
  backgroundColor: string
  textColors: {
    primary: string
    secondary: string
    disabled: string
  }
}

function createSurfaceContextValue(surface: SurfaceType) {
  return {
    surface,
    backgroundColor: getBackgroundColor(surface),
    textColors: getTextColors(surface),
  }
}

export function getTextColors(surface: SurfaceType) {
  if (surface === 'inverted') {
    return theme.colors.text.light
  }
  return theme.colors.text.dark
}

export function getBackgroundColor(surface: SurfaceType) {
  return theme.colors.surface[surface]
}

export const SurfaceContext = React.createContext<SurfaceContextType | undefined>(undefined)

export const SurfaceProvider: React.FC<{ surface: SurfaceType; children?: React.ReactNode }> = ({
  children,
  surface,
}) => (
  <SurfaceContext.Provider
    value={{ surface, backgroundColor: getBackgroundColor(surface), textColors: getTextColors(surface) }}
  >
    {children}
  </SurfaceContext.Provider>
)

export function MaybeSurfaceProvider({ surface, ...rest }: React.PropsWithChildren<{ surface?: SurfaceType }>) {
  return surface ? <SurfaceProvider surface={surface} {...rest} /> : <Fragment {...rest} />
}

export const useSurfaceContext = (surface?: SurfaceType) => {
  const context = React.useContext(SurfaceContext)
  // if the consumer of the hook provides it's own surface we return that
  if (surface !== undefined) {
    return createSurfaceContextValue(surface)
  }
  if (context === undefined) {
    return { ...createSurfaceContextValue('main'), backgroundColor: 'transparent' }
  }
  return context
}

export const Surface: React.FC<{ surface: SurfaceType; className?: string; children?: React.ReactNode }> = ({
  surface,
  children,
  ...rest
}) => {
  return (
    <SurfaceProvider surface={surface}>
      <div
        css={css`
          background-color: ${getBackgroundColor(surface)};
        `}
        {...rest}
      >
        {children}
      </div>
    </SurfaceProvider>
  )
}
