import React, { useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import {
  PickersDay,
  type PickersDayProps,
} from "@mui/x-date-pickers/PickersDay";
import enGB from "date-fns/locale/en-GB";
import { useTheme } from "@/context/ThemeContext";
import {
  type AvailableDays,
  type ComplianceDay,
  type ComplianceView,
  dateToDay,
  dayToDate,
  periodContains,
  periodEnd,
  periodHasData,
  periodStart,
} from "./period";

type WeekDayProps = PickersDayProps<Date> & {
  selectedDay?: ComplianceDay;
};

/** Highlights the whole Monday–Sunday row of the selected week. */
function WeekDay({ selectedDay, ...props }: WeekDayProps) {
  const day = dateToDay(props.day);
  const inWeek =
    selectedDay !== undefined && periodContains("week", selectedDay, day);
  const isStart = inWeek && day === periodStart("week", selectedDay!);
  const isEnd = inWeek && day === periodEnd("week", selectedDay!);

  return (
    <PickersDay
      {...props}
      selected={false}
      disableMargin
      sx={
        inWeek
          ? {
              borderRadius: 0,
              backgroundColor: "var(--color-action)",
              color: "#fff",
              "&:hover, &:focus": {
                backgroundColor: "var(--color-action)",
              },
              ...(isStart && {
                borderTopLeftRadius: "50%",
                borderBottomLeftRadius: "50%",
              }),
              ...(isEnd && {
                borderTopRightRadius: "50%",
                borderBottomRightRadius: "50%",
              }),
            }
          : { borderRadius: 0 }
      }
    />
  );
}

/**
 * Picks a day, week or month. Days, weeks and months without a recorded
 * snapshot can't be picked; the period containing `today` is always live.
 */
export function ComplianceCalendar({
  view,
  selected,
  today,
  oldestDate,
  days,
  onSelect,
}: {
  view: ComplianceView;
  selected: ComplianceDay;
  today: ComplianceDay;
  oldestDate: ComplianceDay | undefined;
  days: AvailableDays;
  onSelect: (day: ComplianceDay) => void;
}) {
  const { isDark } = useTheme();
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          primary: { main: isDark ? "#60a5fa" : "#0e7cc1" },
          background: { paper: isDark ? "#1e293b" : "#ffffff" },
          text: {
            primary: isDark ? "#e2e8f0" : "#002b45",
            secondary: isDark ? "#94a3b8" : "#666666",
          },
        },
        typography: { fontFamily: "inherit" },
      }),
    [isDark],
  );
  const daySet = useMemo(() => new Set(days), [days]);

  const minDate = dayToDate(
    oldestDate && oldestDate < today ? oldestDate : today,
  );
  const maxDate = dayToDate(today);

  const hasData = (period: ComplianceView, day: ComplianceDay) =>
    periodContains(period, day, today) ||
    (period === "day" ? daySet.has(day) : periodHasData(period, day, days));

  const yearHasData = (year: number) =>
    String(year) === today.slice(0, 4) ||
    days.some((d) => d.startsWith(`${year}-`));

  const common = {
    value: dayToDate(selected),
    minDate,
    maxDate,
    disableFuture: true,
    shouldDisableYear: (d: Date) => !yearHasData(d.getFullYear()),
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
        {view === "month" ? (
          <DateCalendar
            {...common}
            views={["year", "month"]}
            openTo="month"
            shouldDisableMonth={(d) => !hasData("month", dateToDay(d))}
            onChange={(d, state) => {
              if (d && state === "finish") onSelect(dateToDay(d));
            }}
          />
        ) : (
          <DateCalendar
            {...common}
            views={["year", "day"]}
            openTo="day"
            shouldDisableDate={(d) => !hasData(view, dateToDay(d))}
            onChange={(d, state) => {
              if (d && state === "finish") onSelect(dateToDay(d));
            }}
            {...(view === "week" && {
              showDaysOutsideCurrentMonth: true,
              slots: { day: WeekDay },
              slotProps: { day: { selectedDay: selected } as any },
            })}
          />
        )}
      </LocalizationProvider>
    </ThemeProvider>
  );
}
