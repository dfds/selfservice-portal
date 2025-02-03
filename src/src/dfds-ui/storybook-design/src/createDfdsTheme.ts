import { create } from '@storybook/theming'

export default function createDfdsTheme(title: string, logo: string) {
  return create({
    base: 'light',
    brandTitle: title,
    brandImage: logo,
  })
}
