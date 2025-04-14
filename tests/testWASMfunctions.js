import assert from "assert";
import * as exports from "../build/debug.js";

// RNG default algorithm
console.time("WASM RNG instantiation");
const rng = exports.RNGnew(1234);
console.timeEnd("WASM RNG instantiation");
console.time("WASM RNG random");
assert.strictEqual(exports.RNGrandom(rng), 0.10858841380104423);
console.timeEnd("WASM RNG random");
// assert.strictEqual(exports.RNGrandInt(rng, rng), 128476320); // Specific to the default RNG
// assert.strictEqual(exports.RNGrandRange(rng, 1, 2087), 84);
// assert.strictEqual(exports.RNGchoice(rng, [1, 2, 3, 4, 5]), 5);
// assert.deepStrictEqual(exports.RNGchoices(rng, [1, 2, 3, 4, 5], {k: 3}), [5, 1, 3]);
// assert.strictEqual(exports.RNGuniform(rng, 5), 2.8058797121047974);
// assert.deepStrictEqual(exports.RNGshuffled(rng, [1, 2, 3, 4, 5]), [3, 5, 2, 1, 4]);
// exports.RNGseed(rng, 1234);
// assert.strictEqual(exports.RNGuniform(rng, 5, 7), 5.2171768276020885);
// exports.RNGseed(rng, 1234);
// assert.strictEqual(exports.RNGuniform(rng, 7, 5), 6.7828231723979115);
exports.RNGseed(rng, 1234);
assert.strictEqual(exports.RNGrandom(rng), 0.10858841380104423, "Reseeding doesn't give the same state as passing the seed to the constructor");
// rng.seed = "frehtjdfhdffvd"; // Reseeding with a string

// Mersenne Twister algorithm
console.time("WASM MT instantiation");
const mt = exports.MTnew(1234);
console.timeEnd("WASM MT instantiation");
console.time("WASM MT random");
assert.strictEqual(exports.MTrandom(mt), 0.1337936078198254);
console.timeEnd("WASM MT random");
exports.MTseed(mt, 1234);
assert.strictEqual(exports.MTrandom(mt), 0.1337936078198254, "Reseeding doesn't give the same state as passing the seed to the constructor");

// Park-Miller algorithm
console.time("WASM PM instantiation");
const pm = exports.PMnew(1234);
console.timeEnd("WASM PM instantiation");
console.time("WASM PM random");
assert.strictEqual(exports.PMrandom(pm), 0.009657739666131204);
console.timeEnd("WASM PM random");
exports.PMseed(pm, 1234);
assert.strictEqual(exports.PMrandom(pm), 0.009657739666131204, "Reseeding doesn't give the same state as passing the seed to the constructor");
