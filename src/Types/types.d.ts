interface Game {
  _id: string;
  name: string;
  icon_name: string;
  mainBallCount: number;
  mainBallMax: number;
  specialBallCount: number;
  specialBallMax: number;
  hotColdCount?: number;
}

interface DrawType {
  _id: string;
  gameId: string;
  name: string;
  icon_name: string;
  hour: number;
  minute: number;
  timeZone: string;
}

interface Draw {
  _id: string;
  gameId: string;
  drawTypeId: string;
  date: number;
  balls: number[];
  specialBalls: number[];
  pending: boolean;
}

interface DashboardEntry {
  game: Game;
  drawType: DrawType;
  latestDraw: Draw | null;
}

interface DrawWithContext extends Draw {
  game: Game;
  drawType: DrawType;
}

interface BallStat {
  ball: number;
  times: number;
}

interface BallFrequencySection {
  gameId: string;
  name: string;
  hotBall: BallStat[];
  coldBall: BallStat[];
}

interface BallFrequencyData {
  sections: BallFrequencySection[];
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
