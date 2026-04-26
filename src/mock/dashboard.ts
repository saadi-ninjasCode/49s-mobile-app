import type { DashboardEntry } from '../types';

const now = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const dashboardInfo: DashboardEntry[] = [
  {
    lottery: {
      _id: 'lotto-uk',
      name: 'Lotto',
      icon_name: 'trophy',
      next_draw: now + 2 * DAY + 5 * HOUR,
    },
    draw: {
      _id: 'draw-lotto-1',
      date: now - 3 * DAY,
      balls: [7, 14, 22, 31, 38, 49],
      specialBalls: [3],
      pending: false,
    },
  },
  {
    lottery: {
      _id: 'euromillions',
      name: 'EuroMillions',
      icon_name: 'star',
      next_draw: now + 1 * DAY + 12 * HOUR,
    },
    draw: {
      _id: 'draw-euro-1',
      date: now - 1 * DAY,
      balls: [4, 18, 27, 33, 47],
      specialBalls: [5, 11],
      pending: false,
    },
  },
  {
    lottery: {
      _id: 'thunderball',
      name: 'Thunderball',
      icon_name: 'bolt',
      next_draw: now + 8 * HOUR,
    },
    draw: {
      _id: 'draw-thunder-1',
      date: now - 2 * DAY,
      balls: [9, 16, 21, 30, 39],
      specialBalls: [12],
      pending: false,
    },
  },
  {
    lottery: {
      _id: 'set-for-life',
      name: 'Set For Life',
      icon_name: 'crown',
      next_draw: now + 4 * DAY + 3 * HOUR,
    },
    draw: {
      _id: 'draw-sfl-1',
      date: now + 30 * 60 * 1000,
      balls: [],
      specialBalls: [],
      pending: true,
    },
  },
  {
    lottery: {
      _id: 'health-lottery',
      name: 'Health Lottery',
      icon_name: 'heart',
      next_draw: now + 6 * DAY,
    },
    draw: {
      _id: 'draw-health-1',
      date: now - 5 * DAY,
      balls: [2, 13, 25, 36, 44],
      specialBalls: [],
      pending: false,
    },
  },
];
