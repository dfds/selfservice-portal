import React from 'react'
import { render } from '@testing-library/react'
import LocaleSelector from '../LocaleSelector'

describe('<LocaleSelector />', () => {
  const costumeLabel = 'Costum3L@bel_'

  it('should render without errors', () => {
    render(<LocaleSelector currentLocale="tr-TR" onChange={() => undefined} />)
  })
  it('should render costume label', () => {
    const { getAllByText } = render(
      <LocaleSelector currentLocale="tr-TR" onChange={() => undefined} label={costumeLabel} />
    )
    expect(getAllByText(costumeLabel).length).toBe(1)
  })
})
