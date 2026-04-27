import type { DashboardEntry, LotteryDraw } from '../types';
import { randomBalls } from '../utilities/lottery';
import { dashboardInfo } from './dashboard';

const DAY = 24 * 60 * 60 * 1000;

function buildHistory(entry: DashboardEntry): LotteryDraw[] {
  const baseDate = entry.draw?.date ?? Date.now();
  const draws: LotteryDraw[] = [];

  for (let i = 0; i < 12; i++) {
    if (i === 0 && entry.draw) {
      draws.push({
        _id: `${entry.lottery._id}-draw-0`,
        lottery: entry.lottery,
        date: entry.draw.date,
        balls: entry.draw.balls,
        specialBalls: entry.draw.specialBalls,
        pending: entry.draw.pending,
      });
    } else {
      const ballCount = Math.max(entry.draw.balls.length || 0, 5);
      const specialCount = entry.draw.specialBalls.length;
      draws.push({
        _id: `${entry.lottery._id}-draw-${i}`,
        lottery: entry.lottery,
        date: baseDate - i * 7 * DAY,
        balls: randomBalls(ballCount, 49),
        specialBalls: specialCount > 0 ? randomBalls(specialCount, 12) : [],
        pending: false,
      });
    }
  }

  return draws;
}

const drawsByLottery: Record<string, LotteryDraw[]> = {};
dashboardInfo.forEach((entry) => {
  drawsByLottery[entry.lottery._id] = buildHistory(entry);
});

export function getDrawsForLottery(lotteryId: string | undefined | null): LotteryDraw[] {
  if (!lotteryId) return [];
  return drawsByLottery[lotteryId] ?? [];
}
