import { dateToCustom, dateToTime, dateToZone, dateWithWeekday } from './date';

export const ballsTransformation = (balls: number[], pending: boolean): string => {
  if (pending) return 'Pending';
  if (balls.length === 0) return '-';
  return balls.map((x) => (x ? String(x) : '-')).join(', ');
};

export const ballFrequencyTransformation = (balls: BallStat[]): string => {
  if (balls.length < 1) return 'None';
  const ballArr: string[] = new Array(balls.length).fill('-');
  balls.forEach((x, index) => {
    ballArr[index] = x.ball ? String(x.ball) : '-';
  });
  return ballArr.join(' , ');
};

export const ballFrequencyTimeTransformation = (balls: BallStat[]): string => {
  if (balls.length < 1) return 'None';
  const timeArr: string[] = new Array(balls.length).fill('-');
  balls.forEach((x, index) => {
    timeArr[index] = x.times ? String(x.times) : '-';
  });
  return timeArr.join(' , ');
};

export const dateTransformation = (date: number | null | undefined, weekday = false): string => {
  if (!date) return '-';
  return weekday ? dateWithWeekday(date) : dateToCustom(date);
};

export const getZone = (date: number | null | undefined): string => (date ? dateToZone(date) : '-');
export const getTime = (date: number | null | undefined): string => (date ? dateToTime(date) : '-');
