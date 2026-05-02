import type { Draw, DrawWithContext, Game } from '../types';
import { randomBalls, randomBoosterBall } from '../utilities/draw';
import { drawTypes } from './drawTypes';
import { games } from './games';

const DAY = 24 * 60 * 60 * 1000;
const HISTORY_DAYS = 60;

function buildHistoryFor(drawTypeId: string, gameId: string): Draw[] {
  const game = games.find((g) => g._id === gameId);
  if (!game) return [];

  const baseMidnight = new Date();
  baseMidnight.setHours(0, 0, 0, 0);

  const draws: Draw[] = [];
  for (let i = 1; i <= HISTORY_DAYS; i++) {
    const date = baseMidnight.getTime() - i * DAY;
    const balls = randomBalls(game.mainBallCount, game.mainBallMax);
    const specialBalls =
      game.specialBallCount > 0
        ? Array.from({ length: game.specialBallCount }, () =>
            randomBoosterBall(balls, game.specialBallMax),
          )
        : [];
    draws.push({
      _id: `${drawTypeId}-${i}`,
      gameId,
      drawTypeId,
      date,
      balls,
      specialBalls,
      pending: false,
    });
  }
  return draws;
}

const drawsByType: Record<string, Draw[]> = {};
drawTypes.forEach((dt) => {
  drawsByType[dt._id] = buildHistoryFor(dt._id, dt.gameId);
});

export function getDrawsForDrawType(drawTypeId: string | null | undefined): DrawWithContext[] {
  if (!drawTypeId) return [];
  const list = drawsByType[drawTypeId];
  if (!list) return [];
  const drawType = drawTypes.find((d) => d._id === drawTypeId);
  if (!drawType) return [];
  const game = games.find((g) => g._id === drawType.gameId);
  if (!game) return [];
  return list.map((d) => ({ ...d, game, drawType }));
}

export function getLatestDrawForType(drawTypeId: string): Draw | null {
  return drawsByType[drawTypeId]?.[0] ?? null;
}

export function getGameForDrawType(drawTypeId: string): Game | undefined {
  const drawType = drawTypes.find((d) => d._id === drawTypeId);
  if (!drawType) return undefined;
  return games.find((g) => g._id === drawType.gameId);
}
