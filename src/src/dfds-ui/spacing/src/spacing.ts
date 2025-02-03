const spacing = {
  /** 0.25rem (4px) */
  xxs: '.25rem',

  /** 0.5rem (8px) */
  xs: '.5rem',

  /** 1rem (16px) */
  s: '1rem',

  /** 1.5rem (24px) */
  m: '1.5rem',

  /** 2rem (32px) */
  l: '2rem',

  /** 3rem (48px) */
  xl: '3rem',

  /** 4rem (64px) */
  xxl: '4rem',
}

type ValueOf<T> = T[keyof T]

export type SpacingValue = ValueOf<typeof spacing>

export type SpacingKey = keyof typeof spacing

export default spacing
