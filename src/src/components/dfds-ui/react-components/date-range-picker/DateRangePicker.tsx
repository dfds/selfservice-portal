/* eslint-disable deprecation/deprecation */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DayPickerRangeController, FocusedInputShape, DayPickerSingleDateController } from 'react-dates'
import classNames from 'classnames'
// eslint-disable-next-line import/no-extraneous-dependencies
import moment, { Moment } from 'moment'
import React, { useState, useRef, useEffect } from 'react'
import 'react-dates/initialize'
import { css } from '@emotion/react'
import { Close, RightLink, LeftLink, CalendarOutbound, CalendarReturn } from '@dfds-ui/icons'
import useMedia from '../common/use-media'
import { miniMoize } from '../common/miniMoize'
import DatePickerDefaultStyles from './DatePickerDefaultStyles'
import DatePickerDfdsStyles from './DatePickerDfdsStyles'
import LockBodyScroll from '../common/LockBodyScroll'
interface IDateRangePickerProps {
  endDateDisabled?: boolean
  valid: boolean
  onDateChange: (d: string | null, r: string | null) => void
  format?: string
  infoLabel?: string
  startDates: IDateLeg
  endDates: IDateLeg
  labels: IDateRangePickerLabels
  onNextMonthClick?: () => void
  onPrevMonthClick?: () => void
  numberOfMobileMonths?: number
  hideIcon?: boolean
  className?: string
  locale?: string
}
interface IDateLeg {
  initial: string | null
  maxDate: string
  minDate: string
  disabledDates?: string[]
  offerDates?: string[]
}
interface IDateRangePickerLabels {
  start: string
  end: string
  header: string
  info?: string
}
// Do a wrapper to support styled components: https://github.com/airbnb/react-dates/issues/1030#issuecomment-388227454
const DateRangePicker: React.FC<IDateRangePickerProps> = (props) => {
  const [startDate, setStartDate] = useState(toMoment(props.startDates.initial))
  const [endDate, setEndDate] = useState(toMoment(props.endDates.initial))
  const [showCalendar, setShowCalendar] = useState(false)
  const [focusedInput, setFocusedInput] = useState('startDate' as FocusedInputShape)
  const { numberOfMonths, mobileState, size } = useMedia(
    ['(max-width: 64em)', '(min-width: 78.063em)'],
    [
      { numberOfMonths: props.numberOfMobileMonths || 12, mobileState: true, size: 40 },
      { numberOfMonths: 2, mobileState: false, size: 48 },
    ],
    { numberOfMonths: 1, mobileState: false, size: 48 }
  )

  moment.locale(props.locale)
  moment().weekday(0)

  useEffect(() => {
    setStartDate(toMoment(props.startDates.initial))
    setEndDate(toMoment(props.endDates.initial))
  }, [props.startDates.initial, props.endDates.initial])
  const closeExceptionDivOut = useRef(null)
  const closeExceptionImgOut = useRef(null)
  const startCalendarClicked = () => {
    setShowCalendar((prev) => !prev)
    setFocusedInput('startDate')
  }
  const endCalendarClicked = () => {
    setShowCalendar((prev) => !prev)
    setFocusedInput('endDate')
  }
  const onOutsideClick = ({ target }: any) => {
    if (target === closeExceptionDivOut.current || target === closeExceptionImgOut.current) {
      return
    }
    setShowCalendar(false)
    setFocusedInput('startDate')
    props.onDateChange(getKeyStr(startDate), getKeyStr(endDate))
  }
  const renderCalendarInfo = () =>
    props.infoLabel ? (
      <div className="dateRangePickerInfo">
        <span className="dateRangePickerInfo__legend" />
        <p className="dateRangePickerInfo__info">{props.infoLabel}</p>
      </div>
    ) : (
      ''
    )
  const disabledDates = miniMoize(
    (focusedInput: string, start: string, startDisabledDates: string[], endDisabledDates: string[]) =>
      buildMap(
        focusedInput !== 'endDate'
          ? startDisabledDates
          : (startDisabledDates || []).filter((d) => d < start).concat(endDisabledDates)
      )
  )
  const isDayBlocked = (date: Moment) => {
    const startDateStr = getKeyStr(startDate)
    const disabled = disabledDates(
      focusedInput,
      startDateStr,
      props.startDates.disabledDates,
      props.endDates.disabledDates
    )
    const dateN = getKeyStr(date)
    if (!dateN) {
      return false
    }
    const d = focusedInput !== 'endDate' ? props.startDates : props.endDates
    const min = props.startDates.minDate
    if (disabled[dateN]) {
      return true
    }
    if (min && dateN && dateN < min) {
      return true
    }
    if (d.maxDate && dateN && dateN > d.maxDate) {
      return true
    }
    if (focusedInput === 'endDate' && startDateStr && startDateStr < dateN && dateN < props.endDates.minDate) {
      return true
    }
    return false
  }
  const offerDates = miniMoize((focusedInput: string, startOffers: string[], endOffers: string[]) =>
    buildMap(focusedInput !== 'endDate' ? startOffers : endOffers)
  )
  const isOfferValid = (date: Moment) => {
    const map = offerDates(focusedInput, props.startDates.offerDates, props.endDates.offerDates)
    return map[getKeyStr(date)!]
  }
  const minimumNights = () => {
    const start = toMoment(props.startDates.initial)
    const end = toMoment(props.endDates.minDate)
    return end && start ? end.diff(start, 'days') : 0
  }
  const initialMonth = () => (mobileState ? toMoment(props.startDates.minDate) : startDate) || moment()
  const sharedCustomProps = {
    hideKeyboardShortcutsPanel: true,
    navPrev: <LeftLink aria-label="Previous Month" />,
    navNext: <RightLink aria-label="Next Month" />,
    weekDayFormat: 'ddd',
    daySize: size,
    monthFormat: 'MMMM YYYY',
    dayAriaLabelFormat: 'YYYY-MM-DD',
    transitionDuration: 100,
    numberOfMonths,
    onOutsideClick,
    isDayBlocked: (d: Moment) => isDayBlocked(d),
    isDayHighlighted: (d: Moment) => isOfferValid(d),
    initialVisibleMonth: initialMonth,
    renderCalendarInfo,
  }
  return (
    <LockBodyScroll enabled={mobileState && showCalendar}>
      <div
        className={'outer ' + props.className}
        css={css`
          ${DatePickerDefaultStyles};
          ${DatePickerDfdsStyles};
          position: relative;
        `}
      >
        <div className={classNames('dateRangePickerWrapper', { 'dateRangePickerWrapper--active': showCalendar })}>
          {mobileState && showCalendar && (
            <>
              <h2 className="dateRangePickerWrapper__title">{props.labels.header}</h2>
              <span className="dateRangePickerWrapper__close" onClick={() => setShowCalendar(false)}>
                <Close />
              </span>
            </>
          )}
          <div
            className={classNames({
              datepicker_container: true,
              datepicker_open: showCalendar,
            })}
          >
            <div
              className={classNames({
                dateInputs: true,
                dateInputs__errorBorder: !props.valid && !showCalendar,
                dateInputs__focus_out: focusedInput === 'startDate' && showCalendar,
                dateInputs__nonfocus: focusedInput === 'endDate' && showCalendar,
                fromDate: true,
                dateInputs__hideIcon: props.hideIcon,
              })}
              onClick={startCalendarClicked}
              ref={closeExceptionDivOut}
            >
              <label className="dateInputs__label">{props.labels.start}</label>
              {!props.hideIcon && <CalendarOutbound className="dateInputs__icon" ref={closeExceptionImgOut} />}
              <input
                className="dateInputs__input"
                type="text"
                name="fromDate"
                value={startDate ? startDate.format('ddd DD/MM') : ''}
                readOnly
              />
            </div>
          </div>
          <div
            className={classNames({
              datepicker_container: true,
              datepicker_open: showCalendar,
            })}
          >
            <div
              className={classNames({
                dateInputs: true,
                dateInputs__oneWay: true,
                dateInputs__disabled: props.endDateDisabled,
                'dateInputs__disabled--active': showCalendar && props.endDateDisabled,
                dateInputs__errorBorder: !props.valid && !showCalendar,
                dateInputs__nonfocus: focusedInput === 'startDate' && showCalendar && !props.endDateDisabled,
                dateInputs__focus_ret: focusedInput === 'endDate' && showCalendar,
                endDate: true,
                dateInputs__hideIcon: props.hideIcon,
              })}
              onClick={endCalendarClicked}
            >
              <label className="dateInputs__label">{props.labels.end}</label>
              {!props.hideIcon && <CalendarReturn className="dateInputs__icon" />}
              <input
                className="dateInputs__input"
                type="text"
                name="toDate"
                value={endDate ? endDate.format('ddd DD/MM') : ''}
                readOnly
                disabled={props.endDateDisabled}
              />
            </div>
          </div>
          {showCalendar && !props.endDateDisabled && (
            <DayPickerRangeController
              onNextMonthClick={props.onNextMonthClick}
              onPrevMonthClick={props.onPrevMonthClick}
              // Required props
              onDatesChange={({ startDate, endDate }) => {
                setStartDate(startDate)
                setEndDate(endDate)
                props.onDateChange(getKeyStr(startDate), getKeyStr(endDate))
              }}
              focusedInput={focusedInput}
              startDate={startDate}
              endDate={endDate}
              onFocusChange={(focusedInput: FocusedInputShape | null) => {
                setFocusedInput(focusedInput || 'startDate')
                setShowCalendar(!!focusedInput)
              }}
              // We use phrases to disable extra stuff from aria-label
              phrases={
                { chooseAvailableStartDate: (a: any) => a.date, chooseAvailableEndDate: (a: any) => a.date } as any
              }
              minimumNights={minimumNights()}
              orientation={mobileState ? 'verticalScrollable' : 'horizontal'}
              {...sharedCustomProps}
            />
          )}
          {showCalendar && props.endDateDisabled && (
            <DayPickerSingleDateController
              // Required props
              onDateChange={(date) => {
                setStartDate(date)
                setEndDate(date)
                props.onDateChange(getKeyStr(date), null)
                setShowCalendar(false)
              }}
              onFocusChange={() => undefined}
              focused
              date={startDate}
              orientation={mobileState ? 'verticalScrollable' : 'horizontal'}
              {...sharedCustomProps}
            />
          )}
        </div>
      </div>
    </LockBodyScroll>
  )
}
function getKeyStr(m: Moment | null): string | null {
  return m && m.format('YYYY-MM-DD')
}
function toMoment(n: string | null): Moment | null {
  return n ? moment(n, 'YYYY-MM-DD') : null
}
function buildMap(dates: string[]) {
  const map: { [key: string]: number } = {}
  if (!dates) {
    return map
  }
  for (const d of dates) {
    map[d] = 1
  }
  return map
}
export default DateRangePicker
