import type { FavouriteBallData } from '../types';
import { FORTY_NINES_ID } from './games';

export const favouriteBall: FavouriteBallData = {
  sections: [
    {
      drawTypeId: 'brunchtime',
      gameId: FORTY_NINES_ID,
      name: 'Brunchtime',
      hotBall: [
        { ball: 7, times: 24 },
        { ball: 23, times: 22 },
        { ball: 38, times: 19 },
      ],
      coldBall: [
        { ball: 13, times: 4 },
        { ball: 41, times: 5 },
        { ball: 49, times: 6 },
      ],
    },
    {
      drawTypeId: 'lunchtime',
      gameId: FORTY_NINES_ID,
      name: 'Lunchtime',
      hotBall: [
        { ball: 4, times: 31 },
        { ball: 17, times: 28 },
        { ball: 27, times: 25 },
      ],
      coldBall: [
        { ball: 1, times: 7 },
        { ball: 33, times: 8 },
        { ball: 47, times: 9 },
      ],
    },
    {
      drawTypeId: 'drivetime',
      gameId: FORTY_NINES_ID,
      name: 'Drivetime',
      hotBall: [
        { ball: 9, times: 18 },
        { ball: 16, times: 16 },
        { ball: 30, times: 15 },
      ],
      coldBall: [
        { ball: 2, times: 3 },
        { ball: 21, times: 4 },
        { ball: 39, times: 4 },
      ],
    },
    {
      drawTypeId: 'teatime',
      gameId: FORTY_NINES_ID,
      name: 'Teatime',
      hotBall: [
        { ball: 11, times: 26 },
        { ball: 25, times: 21 },
        { ball: 44, times: 17 },
      ],
      coldBall: [
        { ball: 5, times: 5 },
        { ball: 18, times: 6 },
        { ball: 35, times: 7 },
      ],
    },
  ],
};
