type DateInput = number | string | Date | null | undefined;

const toDate = (date: DateInput): Date => new Date(+(date as number));

const customParts = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
});

const weekdayParts = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const londonTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Europe/London',
});

const ordinal = (n: number): string => {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
};

const partValue = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string =>
  parts.find((p) => p.type === type)?.value ?? '';

export const dateToString = (date: DateInput): string => new Date(date as string | number | Date).toISOString();
export const dateToLocal = (date: DateInput): string => new Date(date as string | number | Date).toLocaleString();
export const dateTolocalDate = (date: DateInput): string => new Date(date as string | number | Date).toLocaleDateString();
export const dateToCustom = (date: DateInput): string => {
  const parts = customParts.formatToParts(toDate(date));
  return `${partValue(parts, 'day')} ${partValue(parts, 'month')} ${partValue(parts, 'year')}, ${partValue(parts, 'hour')}:${partValue(parts, 'minute')}`;
};
export const dateWithWeekdayTime = (date: DateInput): string =>
  new Date(+(date as number)).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
export const dateWithWeekday = (date: DateInput): string => {
  const d = toDate(date);
  const parts = weekdayParts.formatToParts(d);
  return `${partValue(parts, 'weekday')}, ${partValue(parts, 'month')} ${ordinal(d.getDate())} ${partValue(parts, 'year')}`;
};
export const dateToZone = (date: DateInput): string => londonTimeFormatter.format(toDate(date));
export const dateToTime = (date: DateInput): string => timeFormatter.format(toDate(date));

const tzOffsetParts = (timeZone: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

const wallClockToUtc = (
  y: number,
  m: number,
  d: number,
  h: number,
  min: number,
  timeZone: string,
): number => {
  const utcGuess = Date.UTC(y, m - 1, d, h, min, 0);
  const parts = tzOffsetParts(timeZone)
    .formatToParts(new Date(utcGuess))
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
  const tzAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  if (!Number.isFinite(tzAsUtc)) return Number.NaN;
  const offset = tzAsUtc - utcGuess;
  return utcGuess - offset;
};

const tzDateParts = (timeZone: string, ref: Date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(ref)
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
  };
};

export const todaysDrawTimestamp = (
  hour: number,
  minute: number,
  timeZone: string,
): number => {
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || !timeZone) return Number.NaN;
  const { y, m, d } = tzDateParts(timeZone);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return Number.NaN;
  return wallClockToUtc(y, m, d, hour, minute, timeZone);
};

export const nextDrawTimestamp = (
  hour: number,
  minute: number,
  timeZone: string,
): number => {
  const today = todaysDrawTimestamp(hour, minute, timeZone);
  if (!Number.isFinite(today)) return Number.NaN;
  if (today > Date.now()) return today;
  const { y, m, d } = tzDateParts(timeZone);
  const tomorrow = new Date(Date.UTC(y, m - 1, d + 1));
  return wallClockToUtc(
    tomorrow.getUTCFullYear(),
    tomorrow.getUTCMonth() + 1,
    tomorrow.getUTCDate(),
    hour,
    minute,
    timeZone,
  );
};

export const formatLocalDrawTime = (
  hour: number,
  minute: number,
  scheduleTimeZone: string,
  displayTimeZone?: string,
): string => {
  const ts = nextDrawTimestamp(hour, minute, scheduleTimeZone);
  if (!Number.isFinite(ts)) return '—';
  const opts: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  if (displayTimeZone) opts.timeZone = displayTimeZone;
  return new Intl.DateTimeFormat(undefined, opts).format(new Date(ts));
};

export const getLocalTimeZoneAbbr = (): string => {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'short',
  }).formatToParts(new Date());
  return partValue(parts, 'timeZoneName');
};

export const getLocalTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const isSameDay = (a: DateInput, b: DateInput): boolean => {
  if (a == null || b == null) return false;
  const da = toDate(a);
  const db = toDate(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};
