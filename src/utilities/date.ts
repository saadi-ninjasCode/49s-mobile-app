import moment from 'moment-timezone';

type DateInput = number | string | Date | null | undefined;

export const dateToString = (date: DateInput): string => new Date(date as string | number | Date).toISOString();
export const dateToLocal = (date: DateInput): string => new Date(date as string | number | Date).toLocaleString();
export const dateTolocalDate = (date: DateInput): string => new Date(date as string | number | Date).toLocaleDateString();
export const dateToCustom = (date: DateInput): string => moment(+(date as number)).format('D MMMM YYYY, H:m');
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
export const dateWithWeekday = (date: DateInput): string => moment(+(date as number)).format('dddd, MMMM Do YYYY');
export const dateToZone = (date: DateInput): string => moment(+(date as number)).tz('Europe/London').format('hh:mm A');
export const dateToTime = (date: DateInput): string => moment(+(date as number)).format('hh:mm A');
