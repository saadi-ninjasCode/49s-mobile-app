import type { Game } from '../types';

export const FORTY_NINES_ID = 'forty-nines';

export const games: Game[] = [
  {
    _id: FORTY_NINES_ID,
    name: "49's",
    icon_name: 'dice',
    mainBallCount: 6,
    mainBallMax: 49,
    specialBallCount: 1,
    specialBallMax: 49,
  },
];

export function getGameById(gameId: string | null | undefined): Game | undefined {
  if (!gameId) return undefined;
  return games.find((g) => g._id === gameId);
}
