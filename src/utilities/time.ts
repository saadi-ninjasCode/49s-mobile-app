import type { TimeLeft } from '../types';

export function timeDifference(date: number | Date | null | undefined): TimeLeft | null {
  if (!date) return null;
  const target = typeof date === 'number' ? date : date.getTime();
  const difference = target - new Date().getTime();
  if (difference <= 0) return null;
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}
