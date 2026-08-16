export const GAME = {
  width: 400,
  height: 600,
  gravity: 0.42,
  flapVelocity: -7.2,
  pipeWidth: 64,
  pipeGap: 148,
  pipeSpeed: 2.6,
  pipeSpawnEvery: 96,
  birdSize: 28,
  birdX: 96,
  groundHeight: 72,
} as const;

export type Pipe = {
  x: number;
  gapY: number;
  scored: boolean;
};

export type GameState = {
  status: "ready" | "playing" | "over";
  birdY: number;
  velocity: number;
  pipes: Pipe[];
  frame: number;
  score: number;
  best: number;
};

export function createInitialState(best = 0): GameState {
  return {
    status: "ready",
    birdY: GAME.height / 2 - GAME.birdSize / 2,
    velocity: 0,
    pipes: [],
    frame: 0,
    score: 0,
    best,
  };
}

function randomGapY(): number {
  const min = 100;
  const max = GAME.height - GAME.groundHeight - GAME.pipeGap - 80;
  return min + Math.random() * (max - min);
}

export function flap(state: GameState): GameState {
  if (state.status === "over") return state;
  return {
    ...state,
    status: "playing",
    velocity: GAME.flapVelocity,
  };
}

export function restart(best: number): GameState {
  return createInitialState(best);
}

export function step(state: GameState): GameState {
  if (state.status !== "playing") return state;

  const velocity = state.velocity + GAME.gravity;
  const birdY = state.birdY + velocity;
  let pipes = state.pipes.map((pipe) => ({ ...pipe, x: pipe.x - GAME.pipeSpeed }));
  let score = state.score;
  const frame = state.frame + 1;

  if (frame % GAME.pipeSpawnEvery === 0) {
    pipes = [
      ...pipes,
      {
        x: GAME.width + 10,
        gapY: randomGapY(),
        scored: false,
      },
    ];
  }

  pipes = pipes.filter((pipe) => pipe.x + GAME.pipeWidth > -20);

  const birdTop = birdY;
  const birdBottom = birdY + GAME.birdSize;
  const birdLeft = GAME.birdX;
  const birdRight = GAME.birdX + GAME.birdSize;
  const floorY = GAME.height - GAME.groundHeight;

  let hit = birdTop <= 0 || birdBottom >= floorY;

  for (const pipe of pipes) {
    const inX = birdRight > pipe.x && birdLeft < pipe.x + GAME.pipeWidth;
    if (inX) {
      const gapTop = pipe.gapY;
      const gapBottom = pipe.gapY + GAME.pipeGap;
      if (birdTop < gapTop || birdBottom > gapBottom) {
        hit = true;
        break;
      }
    }
    if (!pipe.scored && pipe.x + GAME.pipeWidth < birdLeft) {
      pipe.scored = true;
      score += 1;
    }
  }

  const best = Math.max(state.best, score);

  if (hit) {
    return {
      ...state,
      birdY,
      velocity,
      pipes,
      frame,
      score,
      best,
      status: "over",
    };
  }

  return {
    ...state,
    birdY,
    velocity,
    pipes,
    frame,
    score,
    best,
  };
}
