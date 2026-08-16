import assert from "node:assert/strict";
import {
  createInitialState,
  flap,
  restart,
  step,
} from "../lib/flappy-engine.ts";

const ready = createInitialState(3);
assert.equal(ready.status, "ready");
assert.equal(ready.best, 3);

const playing = flap(ready);
assert.equal(playing.status, "playing");
assert.ok(playing.velocity < 0);

let state = playing;
for (let i = 0; i < 8; i += 1) {
  state = step(state);
}
assert.equal(state.status, "playing");
assert.ok(state.birdY !== playing.birdY);

const fresh = restart(9);
assert.equal(fresh.status, "ready");
assert.equal(fresh.score, 0);
assert.equal(fresh.best, 9);
assert.equal(fresh.pipes.length, 0);

console.log("flappy-engine smoke checks passed");
