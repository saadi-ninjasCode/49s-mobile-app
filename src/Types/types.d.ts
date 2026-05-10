interface Game {
  _id: string;
  slug?: string;
  name: string;
  icon_name: string;
  mainBallCount: number;
  mainBallMax: number;
  specialBallCount: number;
  specialBallMax: number;
  hotColdCount?: number;
  hotBall?: BallStat[];
  coldBall?: BallStat[];
  serverUpdatedAt?: number;
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
  /**
   * UTC instant (ms since epoch). Semantically a London civil time —
   * always project to Europe/London before deriving a civil day/time.
   * See .claude/rules/firestore.md (`draws` collection).
   */
  date: number;
  balls: number[];
  specialBalls: number[];
  serverUpdatedAt?: number;
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
