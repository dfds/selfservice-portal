// replacement for the rem function from polished
export const rem = (targetPixelValue: number, base = 16) => {
  return `${targetPixelValue / base}rem`
}
