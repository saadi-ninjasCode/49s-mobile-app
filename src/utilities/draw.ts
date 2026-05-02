export const MAX_BALL = 49;

export function randomBalls(count: number, max: number = MAX_BALL): number[] {
  const set = new Set<number>();
  while (set.size < count) {
    set.add(Math.floor(Math.random() * max) + 1);
  }
  return [...set].sort((a, b) => a - b);
}

export function randomBoosterBall(exclude: number[], max: number = MAX_BALL): number {
  const taken = new Set(exclude);
  let n: number;
  do {
    n = Math.floor(Math.random() * max) + 1;
  } while (taken.has(n));
  return n;
}
