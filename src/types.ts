export interface Game {
  _id: string;
  name: string;
  icon_name: string;
  mainBallCount: number;
  mainBallMax: number;
  specialBallCount: number;
  specialBallMax: number;
}

export interface DrawType {
  _id: string;
  gameId: string;
  name: string;
  icon_name: string;
  next_draw: number;
}

export interface Draw {
  _id: string;
  gameId: string;
  drawTypeId: string;
  date: number;
  balls: number[];
  specialBalls: number[];
  pending: boolean;
}

export interface DashboardEntry {
  game: Game;
  drawType: DrawType;
  latestDraw: Draw | null;
}

export interface DrawWithContext extends Draw {
  game: Game;
  drawType: DrawType;
}

export interface BallStat {
  ball: number;
  times: number;
}

export interface FavouriteDrawTypeSection {
  drawTypeId: string;
  gameId: string;
  name: string;
  hotBall: BallStat[];
  coldBall: BallStat[];
}

export interface FavouriteBallData {
  sections: FavouriteDrawTypeSection[];
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
