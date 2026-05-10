import { format } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const LONDON_TZ = 'Europe/London';

const pad2 = (n: number): string => String(n).padStart(2, '0');

const civilDayInTz = (timeZone: string, daysOffset = 0): string => {
  const today = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
  if (daysOffset === 0) return today;
  const [y, m, d] = today.split('-').map(Number);
  // Date.UTC handles month/year rollover; format the resulting UTC instant
  // back to a civil date string in UTC (no tz drift on the +1 step).
  const shifted = new Date(Date.UTC(y, m - 1, d + daysOffset));
  return formatInTimeZone(shifted, 'UTC', 'yyyy-MM-dd');
};

const wallClockUtc = (
  civilDate: string,
  hour: number,
  minute: number,
  timeZone: string,
): number => {
  const wall = `${civilDate}T${pad2(hour)}:${pad2(minute)}:00`;
  return fromZonedTime(wall, timeZone).getTime();
};

export const todaysDrawTimestamp = (
  hour: number,
  minute: number,
  timeZone: string,
): number => {
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || !timeZone) return Number.NaN;
  return wallClockUtc(civilDayInTz(timeZone, 0), hour, minute, timeZone);
};

export const nextDrawTimestamp = (
  hour: number,
  minute: number,
  timeZone: string,
): number => {
  const today = todaysDrawTimestamp(hour, minute, timeZone);
  if (!Number.isFinite(today)) return Number.NaN;
  if (today > Date.now()) return today;
  return wallClockUtc(civilDayInTz(timeZone, 1), hour, minute, timeZone);
};

export const formatLocalDrawTime = (
  hour: number,
  minute: number,
  scheduleTimeZone: string,
  displayTimeZone?: string,
): string => {
  const ts = nextDrawTimestamp(hour, minute, scheduleTimeZone);
  if (!Number.isFinite(ts)) return '—';
  const d = new Date(ts);
  return displayTimeZone
    ? formatInTimeZone(d, displayTimeZone, 'h:mm a')
    : format(d, 'h:mm a');
};

export const getLocalTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export interface DrawDateDualZone {
  london: string;
  deviceLocal: string;
  deviceTz: string;
  /** true when the *civil date* coincides in both tz (no need to show both). */
  matchesLondonDate: boolean;
}

const DATE_FORMAT = 'EEEE, MMMM do yyyy';
const CIVIL_DATE_KEY = 'yyyy-MM-dd';

/**
 * Formats a draw's UTC instant as a *date* (no time) in both London civil tz
 * and the user's device tz. Callers render the device-tz date as the primary
 * line and only show the London line when `matchesLondonDate` is false (e.g.
 * a London 23:30 draw that lands on the next civil day in eastern timezones).
 * Time is rendered separately by the caller using the drawType's hour/minute.
 */
export const formatDrawDateBothZones = (
  dateMs: number | null | undefined,
): DrawDateDualZone | null => {
  if (dateMs == null) return null;
  const d = new Date(dateMs);
  const deviceTz = getLocalTimeZone();
  return {
    london: formatInTimeZone(d, LONDON_TZ, DATE_FORMAT),
    deviceLocal: formatInTimeZone(d, deviceTz, DATE_FORMAT),
    deviceTz,
    matchesLondonDate:
      formatInTimeZone(d, LONDON_TZ, CIVIL_DATE_KEY) ===
      formatInTimeZone(d, deviceTz, CIVIL_DATE_KEY),
  };
};

export interface PickedLondonDay {
  civilDate: string;
  rangeStartMs: number;
  rangeEndMs: number;
  label: string;
}

/**
 * Treats the calendar day visible in a date picker (returned by RN's
 * DateTimePicker as a Date interpreted in device tz) as a *London* civil day,
 * and produces the UTC bounds [start, end) that bracket that London day plus
 * a label for display. This is what filter queries actually need — the user
 * picked "May 10" on the calendar, they expect draws stored under London's
 * May 10, regardless of the device tz.
 */
export const pickedDayAsLondon = (picked: Date): PickedLondonDay => {
  const y = picked.getFullYear();
  const m = picked.getMonth();
  const d = picked.getDate();
  // `fromZonedTime(Date, tz)` reads the Date's components in the *system* tz,
  // not UTC — pass an explicit wall-clock string instead. Date.UTC handles
  // month/year rollover for the +1-day end bound.
  const civilDate = `${y}-${pad2(m + 1)}-${pad2(d)}`;
  const nextCivilDate = formatInTimeZone(
    new Date(Date.UTC(y, m, d + 1)),
    'UTC',
    'yyyy-MM-dd',
  );
  const startUtc = fromZonedTime(`${civilDate}T00:00:00`, LONDON_TZ);
  const endUtc = fromZonedTime(`${nextCivilDate}T00:00:00`, LONDON_TZ);
  return {
    civilDate,
    rangeStartMs: startUtc.getTime(),
    rangeEndMs: endUtc.getTime(),
    label: formatInTimeZone(startUtc, LONDON_TZ, 'EEEE, MMMM do yyyy'),
  };
};
