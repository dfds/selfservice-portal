import hydro2 from './hydro2'

// TODO: Was annoying to type this function. Wait for typescript 4.1 and try again
// https://github.com/microsoft/TypeScript/pull/40002
const flatten = <T extends Record<string, unknown>>(
  object: T,
  nestingSeparator = '-',
  prefix = ''
): Record<string, string> =>
  Object.entries(object).reduce(
    (acc, [key, val]) => ({
      ...acc,
      ...(typeof val === 'string'
        ? { [`${prefix}${key}`]: val }
        : typeof val === 'object'
        ? flatten(val as Record<string, unknown>, nestingSeparator, `${prefix}${key}${nestingSeparator}`)
        : {}),
    }),
    {}
  )

export default flatten({ ...hydro2 })
