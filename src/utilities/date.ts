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
