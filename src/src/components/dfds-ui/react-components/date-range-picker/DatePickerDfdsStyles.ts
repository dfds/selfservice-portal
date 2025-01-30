import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

const DatePickerStyles = css`
  // INPUT
  svg {
    color: ${theme.colors.secondary.main};
    fill: ${theme.colors.secondary.main};
  }

  @media only screen and (max-width: 64.063em) {
    svg[aria-label='Previous Month'] {
      display: none;
    }

    svg[aria-label='Next Month'] {
      display: none;
    }
  }

  .DayPicker {
    z-index: 2;

    table {
      border: none;
    }

    table td {
      min-width: 0px;
      border-left: none;
    }

    .chevron_left {
      transform: rotate(180deg);
    }

    .chevron_down {
      transform: rotate(90deg);

      height: 50px;
      width: 50px;

      display: block;
      text-align: right;
    }

    .chevron_disabled {
      opacity: 0.5;
      z-index: 5;
      pointer-events: none;
      user-select: none;
    }

    @media only screen and (min-width: 64.063em) {
      position: absolute;
      right: 0;
    }

    &__navPrev {
      &--disabled {
        display: none;
      }
    }

    &__verticalScrollable {
      height: 100vh;
    }

    &__withBorder {
      border: none;
      border-radius: 0;
      box-shadow: none;
      border: 1px solid ${theme.colors.secondary.light};
      margin-top: -1px;
      z-index: 2;
      padding-bottom: 20px;
    }

    @media (max-width: 64em) {
      &__withBorder {
        border: none;
        border-top: 1px solid ${theme.colors.secondary.light};
      }
    }
  }
  .DayPickerKeyboardShortcuts_show__bottomRight {
    display: none;
  }

  .DayPicker_weekHeader {
    small {
      font-size: 16px;
    }

    &__verticalScrollable {
      border-bottom: none;
    }
  }

  .CalendarMonthGrid {
    background: none;
  }
  .DayPicker_transitionContainer__verticalScrollable {
    /* stylelint-disable */
    padding-top: 20px * 2;
    /* stylelint-enable */
  }

  .CalendarMonthGrid__vertical_scrollable {
    padding-bottom: 20px;
    margin-bottom: 100px;
    margin-top: 30px;
  }

  .DayPickerNavigation__verticalDefault {
    background: ${theme.colors.surface.secondary};
    height: 140px;
  }

  .DayPickerNavigation_button {
    background: none;
    height: 20px;
    position: absolute;
    top: 20px;
    width: 20px;

    &:first-of-type {
      left: 20px;
    }

    &:last-of-type {
      right: 20px;
    }

    .svg-icon {
      height: 100%;
      width: 100%;
    }

    &__verticalDefault {
      box-shadow: none;
      height: 60px;
    }
  }

  .DayPickerNavigation_svg {
    &__vertical {
      display: block;
      height: 50px;
      margin: 0 auto;
      width: 50px;
    }
  }

  // CALENDARMONTH
  .CalendarMonth_table {
    margin: 10px 0 15px;
  }

  .CalendarMonth_caption {
    strong {
      font-weight: 300;
    }
  }

  // CALENDARDAY
  .CalendarDay {
    border-color: ${theme.colors.secondary.light};
    border: none;
    color: ${theme.colors.primary.main};
    font-size: 16px;

    &__highlighted_calendar {
      background: ${theme.colors.surface.primary};

      &::after {
        content: '';
        width: 55%;
        height: 7px;
        background: ${theme.colors.status.success};
        display: block;
        margin: 0px auto 0 auto;
        border-radius: 2px;
      }
      @media only screen and (min-width: 64em) {
        &::after {
          margin-top: 6px;
        }
      }
    }

    &:hover {
      background: ${theme.colors.surface.secondary};
      border: none;
      color: ${theme.colors.primary.main};
    }

    &__blocked_out_of_range,
    &__blocked_calendar,
    &__blocked_minimum_nights {
      background: ${theme.colors.surface.primary};
      color: ${theme.colors.text.dark.disabled};

      &:hover {
        color: ${theme.colors.text.dark.disabled};
      }
    }

    &__selected_span {
      background: ${theme.colors.surface.secondary};
    }

    &__hovered_span {
      background: ${theme.colors.surface.secondary};
    }

    &__selected,
    &__selected_start,
    &__selected_end {
      border: 1px solid ${theme.colors.primary.main};
      /* stylelint-disable */
      border-left: 1px solid ${theme.colors.primary.main} !important;
      /* stylelint-enable */
      background: none;

      &:hover {
        border: 1px solid ${theme.colors.primary.main};
        background: ${theme.colors.surface.primary};
      }
    }
    &__selected_start.CalendarDay__blocked_minimum_nights {
      color: ${theme.colors.primary.main};
    }
  }

  .datepicker_open {
    z-index: 4;
  }

  .datepicker_container {
    display: inline-block;
    width: 50%;
    position: relative;
    background-color: white;

    .dateInputs {
      padding: 7px 0 6px 50px;
      border-radius: 0px;
      border: 1px solid ${theme.colors.text.dark.secondary};
      cursor: pointer;
      position: relative;
      user-select: none;

      &__hideIcon {
        padding: 7px 10px 6px 10px;
      }

      &__focus_out,
      &__errorBorder.dateInputs__focus_out,
      &__focus_ret,
      &__errorBorder.dateInputs__focus_ret {
        border: 1px solid ${theme.colors.secondary.light};
        border-bottom: 1px solid ${theme.colors.surface.primary};
        background-color: ${theme.colors.surface.primary};
      }

      &__nonfocus {
        background-color: ${theme.colors.surface.secondary};
      }

      &__errorBorder.dateInputs__nonfocus {
        background-color: ${theme.colors.surface.secondary};
        border-bottom: 1px solid ${theme.colors.secondary.light};

        input {
          fill: ${theme.colors.text.dark.disabled};
        }
      }

      &__container {
        /* stylelint-disable */
        display: relative;
        /* stylelint-enable */
      }

      &__errorBorder {
        border: 1px solid ${theme.colors.status.alert};
      }

      &__label,
      &__input {
        cursor: pointer;
        font-weight: 400;
        font-family: DFDS, Verdana, system-ui, Arial, 'Helvetica Neue', Helvetica, sans-serif;
        &--disabled {
          color: ${theme.colors.text.dark.disabled};
        }
      }

      &__disabled {
        z-index: 4;
        pointer-events: none;
        border: 1px solid ${theme.colors.text.dark.disabled};
        color: ${theme.colors.text.dark.disabled};

        &--active {
          border-bottom: 1px solid ${theme.colors.secondary.light};
          background-color: ${theme.colors.surface.secondary};
        }
        svg {
          fill: ${theme.colors.text.dark.disabled};
          color: ${theme.colors.text.dark.disabled};
        }
      }

      input[disabled] {
        color: ${theme.colors.text.dark.disabled};
      }

      &__label {
        font-weight: 400;
        font-size: 12px;
        display: block;
        white-space: nowrap;
        margin: 0;
      }

      &__departureDate,
      &__startDate,
      &__endDate {
        background: ${theme.colors.surface.primary};
        border: 1px solid ${theme.colors.secondary.light};
        height: 100%;
        /* stylelint-disable */
        padding: (10px / 2) 0 (10px / 2) (30px * 2);
        /* stylelint-enable */
        position: relative;
        vertical-align: top;
        width: 50%;
        display: flex;
        flex-direction: column;

        &--active {
          border-bottom: none;
        }

        &--disabled {
          border-color: ${theme.colors.surface.secondary};
          background: none;

          .dateInputs__cover {
            display: block;
          }
        }

        .dateRangePickerWrapper--active & {
          z-index: 4;
        }
      }

      &__oneWay {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;

        .dateInputs__cover {
          background: rgba(255, 255, 255, 0.2);
          z-index: 1;
        }

        .dateInputs__endDate--disabled {
          color: ${theme.colors.text.dark.disabled};
        }
      }
      &__icon {
        height: 36px;
        left: 7px;
        position: absolute;
        top: 7px;
        width: 36px;

        .dateInputs__oneWay .dateInputs__endDate--disabled & {
          fill: ${theme.colors.text.dark.disabled};
        }
      }

      &__input {
        background: none;
        border: none;
        display: block;
        font-size: 14px;
        appearance: none;
        margin: 0;
        padding: 4px 0 0;
        pointer-events: none;
        width: 100%;

        &:focus_out {
          font-size: 16px; /* disables auto zoom on ios */
        }

        &:focus_ret {
          font-size: 16px; /* disables auto zoom on ios */
        }
      }

      &__cover {
        display: none;
        width: calc(100% + 2px);
        height: calc(100% + 1px);
        position: absolute;
        top: -1px;
        left: -1px;
        background: rgba(0, 0, 0, 0.2);
        z-index: 5;
      }
    }

    .dateInputs__oneWay {
      border-left-color: #fff;
    }

    .dateInputs__nonfocus.fromDate {
      border-right: none;
    }

    .dateInputs__focus_ret {
      border-left: 1px solid ${theme.colors.secondary.light};
    }

    .dateInputs__nonfocus.endDate {
      border-left: 1px solid ${theme.colors.secondary.light};
    }
  }

  @media only screen and (max-width: 64em) {
    .DayPickerNavigation_button {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;

      margin: auto;
    }

    .dateRangePickerWrapper {
      &--active {
        height: 100%;
        width: 100%;
        position: fixed; /* Stay in place */
        z-index: 99; /* Sit on top */
        left: 0;
        top: 0;
        background-color: ${theme.colors.surface.secondary};
        //overflow-x: hidden; /* Disable horizontal scroll */

        .dateInputs {
          &__disabled {
            border: none;
          }

          &__focus_ret {
            background: white;
            border: none;
            border-top: 1px solid ${theme.colors.secondary.light};
            border-left: 1px solid ${theme.colors.secondary.light};
          }

          &__focus_out {
            background: white;
            border: none;
            border-top: 1px solid ${theme.colors.secondary.light};
            border-right: 1px solid ${theme.colors.secondary.light};
          }

          &__nonfocus {
            border: none;

            input {
              /* stylelint-disable */
              background: ${theme.colors.surface.secondary} !important;
              /* stylelint-enable */
            }
          }
        }
      }

      &__close {
        display: block;
        height: 24px;
        position: absolute;
        right: 20px;
        top: 25px;
        width: 24px;
      }

      h2 {
        color: ${theme.colors.text.dark.primary};
        margin-block-start: 0.83em;
        margin-block-end: 0.83em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        padding-left: 20px;
        font-weight: 700;
        font-size: 28px;
      }
    }
  }

  .dateRangePickerInfo__legend {
    width: 25px;
    height: 7px;
    background: ${theme.colors.status.success};
    border-radius: 2px;
    margin-bottom: 2px;
  }
  .dateRangePickerInfo__info,
  .dateRangePickerInfo__legend {
    display: inline-block;
  }
`

export default DatePickerStyles
