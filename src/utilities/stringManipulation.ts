export const ballFrequencyTransformation = (balls: BallStat[]): string => {
  if (balls.length < 1) return 'None';
  const ballArr: string[] = new Array(balls.length).fill('-');
  balls.forEach((x, index) => {
    ballArr[index] = x.ball ? String(x.ball) : '-';
  });
  return ballArr.join(' , ');
};

export const ballFrequencyTimeTransformation = (balls: BallStat[]): string => {
  if (balls.length < 1) return 'None';
  const timeArr: string[] = new Array(balls.length).fill('-');
  balls.forEach((x, index) => {
    timeArr[index] = x.times ? String(x.times) : '-';
  });
  return timeArr.join(' , ');
};
