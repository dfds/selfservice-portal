import React from 'react'
import { storiesOf } from '@storybook/react'
import DateRangePicker from './DateRangePicker'
import styled from '@emotion/styled'
import { StoryPage, ExampleContainer, Md } from '@dfds-ui/storybook-design'
const stories = storiesOf('Hydro UI/DateRangePicker', module)

const HalfWidth = styled.div`
  @media (min-width: 64em) {
    width: 50%;
  }
`

const PolyfillInfo = () => <p>Required polyfills when targeting es5: es2015, es2017-string, es2017-object</p>
stories.add('Simple', () => (
  <StoryPage>
    <p>Basic usage of date-range-picker.</p>
    <ExampleContainer>
      <HalfWidth>
        <DateRangePicker
          locale="da"
          onDateChange={(_a, _b) => undefined}
          valid
          startDates={{
            initial: '2019-05-05',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          endDates={{
            initial: '2019-01-12',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
        />
      </HalfWidth>
      {Md`
~~~jsx
import { DateRangePicker } from '@/components/dfds-ui/react-components';

<DateRangePicker
  locale="da"
  onDateChange={(a, b) => undefined}
  valid
  startDates={{
    initial: '2019-05-05',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  endDates={{
    initial: '2019-01-12',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
  />
~~~
`}
    </ExampleContainer>
    <PolyfillInfo />
  </StoryPage>
))

stories.add('One Way', () => (
  <StoryPage>
    <p>For cases where end-date is optional, simply set endDateDisabled.</p>
    <ExampleContainer>
      <HalfWidth>
        <DateRangePicker
          locale="da"
          onDateChange={(_a, _b) => undefined}
          valid
          startDates={{
            initial: '2019-01-05',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
            offerDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
          }}
          endDates={{
            initial: '2019-01-05',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          endDateDisabled
          labels={{
            start: 'Outbound',
            end: 'Return',
            header: 'Please select a date',
            info: '25% discount for vehicles and cabins',
          }}
        />
      </HalfWidth>
      {Md`
~~~jsx
import { DateRangePicker } from '@/components/dfds-ui/react-components';

<DateRangePicker
  locale="da"
  onDateChange={(a, b) => undefined}
  valid
  startDates={{
    initial: '2019-01-05',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
    offerDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
  }}
  endDates={{
    initial: '2019-01-05',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  endDateDisabled
  labels={{
    start: 'Outbound',
    end: 'Return',
    header: 'Please select a date',
    info: '25% discount for vehicles and cabins',
  }}
  />
~~~
`}
    </ExampleContainer>
    <PolyfillInfo />
  </StoryPage>
))

stories.add('Offers', () => (
  <StoryPage>
    <p>Offers can be highlighted in green to show user where e.g. a discount applies.</p>
    <ExampleContainer>
      <HalfWidth>
        <DateRangePicker
          locale="da"
          onDateChange={(_a, _b) => undefined}
          valid
          startDates={{
            initial: '2019-01-05',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
            offerDates: ['2019-01-10', '2019-01-11', '2019-01-12'],
          }}
          endDates={{
            initial: '2019-01-12',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
            offerDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
          }}
          labels={{
            start: 'Outbound',
            end: 'Return',
            header: 'Please select a date',
            info: '25% discount for vehicles and cabins',
          }}
        />
      </HalfWidth>
      {Md`
~~~jsx
import { DateRangePicker } from '@/components/dfds-ui/react-components';

<DateRangePicker
  locale="da"
  onDateChange={(a, b) => undefined}
  valid
  startDates={{
    initial: '2019-01-05',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
    offerDates: ['2019-01-10', '2019-01-11', '2019-01-12'],
  }}
  endDates={{
    initial: '2019-01-12',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
    offerDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
  }}
  labels={{
    start: 'Outbound',
    end: 'Return',
    header: 'Please select a date',
    info: '25% discount for vehicles and cabins',
  }}
/>
~~~
`}
    </ExampleContainer>
    <PolyfillInfo />
  </StoryPage>
))

stories.add('Disabled', () => (
  <StoryPage>
    <p>Dates can be disabled e.g. where there is no capacity.</p>
    <ExampleContainer>
      <HalfWidth>
        <DateRangePicker
          locale="da"
          onDateChange={(_a, _b) => undefined}
          valid
          startDates={{
            disabledDates: ['2019-01-10', '2019-01-11', '2019-01-12'],
            initial: '2019-01-05',
            minDate: '2019-01-02',
            maxDate: '2020-01-01',
          }}
          endDates={{
            disabledDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
            initial: '2019-01-14',
            minDate: '2019-01-08',
            maxDate: '2020-01-01',
          }}
          labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
        />
      </HalfWidth>
      {Md`
~~~jsx
import { DateRangePicker } from '@/components/dfds-ui/react-components';

<DateRangePicker
  locale="da"
  onDateChange={(a, b) => undefined}
  valid
  startDates={{
    disabledDates: ['2019-01-10', '2019-01-11', '2019-01-12'],
    initial: '2019-01-05',
    minDate: '2019-01-02',
    maxDate: '2020-01-01',
  }}
  endDates={{
    disabledDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
    initial: '2019-01-14',
    minDate: '2019-01-08',
    maxDate: '2020-01-01',
  }}
  labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
/>
~~~
`}
    </ExampleContainer>
    <PolyfillInfo />
  </StoryPage>
))

stories.add('Invalid', () => (
  <StoryPage>
    <p>
      Indicate to the user that the current choices are not valid. This applies e.g. when the system have selected dates
      that are not valid and requires user input.
    </p>
    <ExampleContainer>
      <HalfWidth>
        <DateRangePicker
          locale="da"
          onDateChange={(_a, _b) => undefined}
          valid={false}
          startDates={{
            disabledDates: ['2019-01-05', '2019-01-11', '2019-01-12'],
            initial: '2019-01-05',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          endDates={{
            disabledDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
            initial: '2019-01-12',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
        />
      </HalfWidth>
      {Md`
~~~jsx
import { DateRangePicker } from '@/components/dfds-ui/react-components';

<DateRangePicker
  locale="da"
  onDateChange={(a, b) => undefined}
  valid={false}
  startDates={{
    disabledDates: ['2019-01-05', '2019-01-11', '2019-01-12'],
    initial: '2019-01-05',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  endDates={{
    disabledDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
    initial: '2019-01-12',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
/>
~~~
`}
    </ExampleContainer>
    <PolyfillInfo />
  </StoryPage>
))

stories.add('Nothing', () => (
  <StoryPage>
    <p>The system can set null as date, allowing the user to select something else.</p>
    <ExampleContainer>
      <HalfWidth>
        <DateRangePicker
          locale="da"
          onDateChange={(_a, _b) => undefined}
          valid={false}
          startDates={{
            disabledDates: ['2019-01-05', '2019-01-11', '2019-01-12'],
            initial: null,
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          endDates={{
            disabledDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
            initial: null,
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
        />
      </HalfWidth>
      {Md`
~~~jsx
import { DateRangePicker } from '@/components/dfds-ui/react-components';

<DateRangePicker
  locale="da"
  onDateChange={(a, b) => undefined}
  valid={false}
  startDates={{
    disabledDates: ['2019-01-05', '2019-01-11', '2019-01-12'],
    initial: null,
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  endDates={{
    disabledDates: ['2019-01-11', '2019-01-12', '2019-01-13'],
    initial: null,
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
  />
~~~
`}
    </ExampleContainer>
    <PolyfillInfo />
  </StoryPage>
))

stories.add('onNextMonthClick / onPrevMonthClick', () => (
  <StoryPage>
    <p>Adds function props to prev- and next-month buttons</p>
    <ExampleContainer>
      <HalfWidth>
        <DateRangePicker
          locale="da"
          onNextMonthClick={() => {
            alert('NEXT MONTH BUTTON HAS BEEN CLICKED')
          }}
          onPrevMonthClick={() => {
            alert('PREV MONTH BUTTON HAS BEEN CLICKED')
          }}
          onDateChange={(_a, _b) => undefined}
          valid
          startDates={{
            initial: '2019-05-05',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          endDates={{
            initial: '2019-01-12',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
        />
      </HalfWidth>
      {Md`
~~~jsx
import { DateRangePicker } from '@/components/dfds-ui/react-components';

<DateRangePicker
  locale="da"
  onNextMonthClick={() => {
    alert('NEXT MONTH BUTTON HAS BEEN CLICKED')
  }}
  onPrevMonthClick={() => {
    alert('PREV MONTH BUTTON HAS BEEN CLICKED')
  }}
  onDateChange={(a, b) => undefined}
  valid
  startDates={{
    initial: '2019-05-05',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  endDates={{
    initial: '2019-01-12',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
  />
~~~
`}
    </ExampleContainer>
    <PolyfillInfo />
  </StoryPage>
))

stories.add('Custom numberOfMobileMonths', () => (
  <StoryPage>
    <p>
      Uses a custom numberOfMobileMonths to decide how much scrolling is needed before a loadMore click is required.
    </p>
    <ExampleContainer>
      <HalfWidth>
        <DateRangePicker
          locale="da"
          numberOfMobileMonths={3}
          onDateChange={(_a, _b) => undefined}
          valid
          startDates={{
            initial: '2019-05-05',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          endDates={{
            initial: '2019-01-12',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
        />
      </HalfWidth>
      {Md`
~~~jsx
import { DateRangePicker } from '@/components/dfds-ui/react-components';

<DateRangePicker
  locale="da"
  numberOfMobileMonths={3}
  onDateChange={(a, b) => undefined}
  valid
  startDates={{
    initial: '2019-05-05',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  endDates={{
    initial: '2019-01-12',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
  />
~~~
`}
    </ExampleContainer>
    <PolyfillInfo />
  </StoryPage>
))

stories.add('hideIcon', () => (
  <StoryPage>
    <p>Hides the icon in the enhancedSelect field</p>
    <ExampleContainer>
      <HalfWidth>
        <DateRangePicker
          locale="da"
          hideIcon
          onDateChange={(_a, _b) => undefined}
          valid
          startDates={{
            initial: '2019-05-05',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          endDates={{
            initial: '2019-01-12',
            minDate: '2019-01-01',
            maxDate: '2020-01-01',
          }}
          labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
        />
      </HalfWidth>
      {Md`
~~~jsx
import { DateRangePicker } from '@/components/dfds-ui/react-components';

<DateRangePicker
  locale="da"
  hideIcon
  onDateChange={(a, b) => undefined}
  valid
  startDates={{
    initial: '2019-05-05',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  endDates={{
    initial: '2019-01-12',
    minDate: '2019-01-01',
    maxDate: '2020-01-01',
  }}
  labels={{ start: 'Outbound', end: 'Return', header: 'Please select a date' }}
  />
~~~
`}
    </ExampleContainer>
    <PolyfillInfo />
  </StoryPage>
))
