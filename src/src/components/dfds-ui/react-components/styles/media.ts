// ***
// DEPRECATED use media from ./media
// ***

// breakpoint used in DFDS-DIRECT
const defaultBreakPoints = {
  xl: 1260,
  lg: 992,
  md: 768,
  sm: 576,
  xs: 575,
}

type BreakPoint = keyof typeof defaultBreakPoints | number

export function legacyGenerateMedia(breakPoints: typeof defaultBreakPoints) {
  const toInt = (breakPoint: BreakPoint) => {
    return typeof breakPoint === 'number' ? breakPoint : breakPoints[breakPoint]
  }

  const lessThan = (breakPoint: BreakPoint) => `
    @media (max-width: ${toInt(breakPoint) - 1}px)`

  const greaterThan = (breakPoint: BreakPoint) => `
    @media (min-width: ${toInt(breakPoint) + 1}px)`

  const between = (firstBreakpoint: BreakPoint, secondBreakpoint: BreakPoint) => `
    @media (min-width: ${toInt(firstBreakpoint)}px) and (max-width: ${toInt(secondBreakpoint)}px)`

  const tablet = () => `
   @media (min-width: ${breakPoints.sm + 1}px) and (max-width: ${breakPoints.md}px)`

  return { lt: lessThan, gt: greaterThan, bt: between, tablet }
}

export const legacyMedia = legacyGenerateMedia(defaultBreakPoints)

export default legacyMedia
