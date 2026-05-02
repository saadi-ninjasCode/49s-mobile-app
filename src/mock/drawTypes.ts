import type { DrawType } from '../types';
import { FORTY_NINES_ID } from './games';

interface ScheduleSeed {
  _id: string;
  gameId: string;
  name: string;
  icon_name: string;
  hour: number;
  minute: number;
}

const schedule: ScheduleSeed[] = [
  { _id: 'brunchtime', gameId: FORTY_NINES_ID, name: 'Brunchtime', icon_name: 'coffee', hour: 10, minute: 49 },
  { _id: 'lunchtime', gameId: FORTY_NINES_ID, name: 'Lunchtime', icon_name: 'utensils', hour: 12, minute: 49 },
  { _id: 'drivetime', gameId: FORTY_NINES_ID, name: 'Drivetime', icon_name: 'car', hour: 17, minute: 49 },
  { _id: 'teatime', gameId: FORTY_NINES_ID, name: 'Teatime', icon_name: 'mug-hot', hour: 21, minute: 49 },
];

function nextOccurrence(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

export const drawTypes: DrawType[] = schedule.map((s) => ({
  _id: s._id,
  gameId: s.gameId,
  name: s.name,
  icon_name: s.icon_name,
  next_draw: nextOccurrence(s.hour, s.minute),
}));

export function getDrawTypeById(drawTypeId: string | null | undefined): DrawType | undefined {
  if (!drawTypeId) return undefined;
  return drawTypes.find((d) => d._id === drawTypeId);
}

export function getDrawTypesForGame(gameId: string): DrawType[] {
  return drawTypes.filter((d) => d.gameId === gameId);
}
