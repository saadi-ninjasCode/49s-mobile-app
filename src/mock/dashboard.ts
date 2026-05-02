import type { DashboardEntry } from '../types';
import { drawTypes } from './drawTypes';
import { getLatestDrawForType } from './draws';
import { games } from './games';

export const dashboardInfo: DashboardEntry[] = drawTypes
  .map((drawType) => {
    const game = games.find((g) => g._id === drawType.gameId);
    if (!game) return null;
    return {
      game,
      drawType,
      latestDraw: getLatestDrawForType(drawType._id),
    };
  })
  .filter((entry): entry is DashboardEntry => entry !== null);
