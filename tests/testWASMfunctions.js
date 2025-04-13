import assert from "assert";
import * as exports from "../build/debug.js";

// RNG default algorithm
const rng = exports.RNGnew(1234);
assert.strictEqual(exports.RNGrandom(rng), 0.10858841380104423);
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
