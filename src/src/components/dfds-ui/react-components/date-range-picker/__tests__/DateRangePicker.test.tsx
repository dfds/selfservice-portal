import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import DateRangePicker from '../DateRangePicker'
import { ignoreDeprecatedReactWarnings } from './ignoreDeprecatedReactWarnings'

// react-dates uses a timeout for setting state for some dom dimension
// calculation. Since under test the component will be unmounted when the
// timeout finishes a warning from react-dom will be triggered. To avoid this
// warning we mock the timer functions https://jestjs.io/docs/en/timer-mocks
jest.useFakeTimers()

// mock console.warning for deprecated lifetime methods
// eslint-disable-next-line no-console
ignoreDeprecatedReactWarnings()

describe('<DateRangePicker />', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn((e) => ({
        matches: !!e.match(/min-width/),
        addListener: () => undefined,
        removeListener: () => undefined,
      })),
    })
  })

  it('should render without errors', () => {
    const { getByLabelText } = renderOpenedDateRangePicker()
    getByLabelText('2019-01-09')
  })

  describe('disabled dates', () => {
    describe('boundaries', () => {
      it('is possible to select min date', () => {
        const { getByLabelText } = renderOpenedDateRangePicker()
        getByLabelText('2019-01-03')
      })

      it('is possible to select max date', () => {
        const { getByLabelText } = renderOpenedDateRangePicker()
        getByLabelText('2019-01-30')
      })
    })

    it('is disabled for date in disabled dates', () => {
      const { queryByLabelText } = renderOpenedDateRangePicker()
      expect(queryByLabelText('2019-01-10')).toBeNull()
    })

    it('is disabled for date before min', () => {
      const { queryByLabelText } = renderOpenedDateRangePicker()
      expect(queryByLabelText('2019-01-02')).toBeNull()
    })

    it('is disabled for date after max', () => {
      const { queryByLabelText } = renderOpenedDateRangePicker()
      expect(queryByLabelText('2019-01-31')).toBeNull()
    })
  })

  describe('disabled dates end', () => {
    describe('boundaries', () => {
      it('is possible to select min date', () => {
        const { getByLabelText } = renderOpenedDateRangePicker('Return')
        getByLabelText('2019-01-04')
      })

      it('is possible to select max date', () => {
        const { getByLabelText } = renderOpenedDateRangePicker('Return')
        getByLabelText('2019-01-29')
      })
    })

    it('should ignore start disabled dates when return is active', () => {
      const { getByLabelText } = renderOpenedDateRangePicker('Return')
      getByLabelText('2019-01-10')
    })

    it('is disabled for date in disabled dates', () => {
      const { queryByLabelText } = renderOpenedDateRangePicker('Return')
      expect(queryByLabelText('2019-01-11')).toBeNull()
    })

    it('end dates min uses start min since it is possible to click before start', () => {
      const { getByLabelText } = renderOpenedDateRangePicker('Return')
      getByLabelText('2019-01-03')
    })

    it('is not possible to select a end date between selected out and min return', () => {
      const { queryByLabelText } = renderOpenedDateRangePicker('Return')
      expect(queryByLabelText('2019-01-06')).toBeNull()
    })

    it('is disabled for date after max', () => {
      const { queryByLabelText } = renderOpenedDateRangePicker('Return')
      expect(queryByLabelText('2019-01-30')).toBeNull()
    })
  })
})

const renderOpenedDateRangePicker = (leg?: string) => {
  const rendered = render(<DateRangePicker {...defaultProps()} />)
  fireEvent.click(rendered.getByText(leg || 'Outbound'))
  return rendered
}

function defaultProps() {
  return {
    onDateChange: () => undefined,
    valid: true,
    startDates: {
      initial: '2019-01-05',
      minDate: '2019-01-03',
      maxDate: '2019-01-30',
      disabledDates: ['2019-01-10'],
    },
    endDates: {
      initial: '2019-01-12',
      minDate: '2019-01-07',
      maxDate: '2019-01-29',
      disabledDates: ['2019-01-11'],
    },
    labels: { start: 'Outbound', end: 'Return', header: 'h2' },
  }
}
