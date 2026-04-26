import type { FavouriteBallData } from '../types';

export const favouriteBall: FavouriteBallData = {
  lottery: [
    {
      name: 'Lotto',
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
      name: 'EuroMillions',
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
      name: 'Thunderball',
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
  ],
};
