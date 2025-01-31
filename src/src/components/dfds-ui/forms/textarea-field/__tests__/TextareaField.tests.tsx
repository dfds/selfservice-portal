import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextareaField } from '../TextareaField'

describe('<TextareaField/>', () => {
  it('should render TextareaField without errors', () => {
    render(<TextareaField name="sample" />)
  })
  it('should restrict adding more characters than allowed', async () => {
    const user = userEvent.setup()
    const s1 = 'This is a string'
    const s2 = 'This is an even longer string'
    const maxValueLength = s1.length
    const { findByRole } = render(<TextareaField name="long-string" maxValueLength={maxValueLength} />)
    const textarea = await findByRole('textbox')
    await user.type(textarea, s2)
    expect(textarea).toHaveValue(s2.substring(0, s1.length))
  })
})
