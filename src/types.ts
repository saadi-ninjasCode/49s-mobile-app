export interface Lottery {
  _id: string;
  name: string;
  icon_name: string;
  next_draw: number;
}

export interface Draw {
  _id: string;
  date: number;
  balls: number[];
  specialBalls: number[];
  pending: boolean;
}

export interface DashboardEntry {
  lottery: Lottery;
  draw: Draw;
}

export interface BallStat {
  ball: number;
  times: number;
}

export interface FavouriteLotterySection {
  name: string;
  hotBall: BallStat[];
  coldBall: BallStat[];
}

export interface FavouriteBallData {
  lottery: FavouriteLotterySection[];
}

export interface LotteryDraw extends Draw {
  lottery: Lottery;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
