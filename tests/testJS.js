import assert from "assert";
import RNG from "../dist/rng.js";

// RNG default algorithm
console.time("JS RNG instantiation");
const rng = new RNG(1234);
console.timeEnd("JS RNG instantiation");
console.time("JS RNG random");
assert.strictEqual(rng.random(), 0.10858841380104423);
console.timeEnd("JS RNG random");
assert.strictEqual(rng.randInt(), 128476320); // Specific to the default RNG
assert.strictEqual(rng.randRange(1, 2087), 84);
assert.strictEqual(rng.choice([1, 2, 3, 4, 5]), 5);
assert.deepStrictEqual(rng.choices([1, 2, 3, 4, 5], {k: 3}), [5, 1, 3]);
assert.strictEqual(rng.uniform(5), 2.8058797121047974);
assert.deepStrictEqual(rng.shuffled([1, 2, 3, 4, 5]), [3, 5, 2, 1, 4]);
rng.seed = 1234;
assert.strictEqual(rng.uniform(5, 7), 5.2171768276020885);
rng.seed = 1234;
assert.strictEqual(rng.uniform(7, 5), 6.7828231723979115);
rng.seed = 1234;
assert.strictEqual(rng.random(), 0.10858841380104423, "Reseeding doesn't give the same state as passing the seed to the constructor");
rng.seed = "frehtjdfhdffvd"; // Reseeding with a string


// Mersenne Twister algorithm
console.time("JS MT instantiation");
const mt = new RNG.MT(1234);
console.timeEnd("JS MT instantiation");
console.time("JS MT random");
assert.strictEqual(mt.random(), 0.1337936078198254);
console.timeEnd("JS MT random");
assert.strictEqual(mt.randRange(1, 2087), 278);
assert.strictEqual(mt.choice([1, 2, 3, 4, 5]), 1);
assert.deepStrictEqual(mt.choices([1, 2, 3, 4, 5], {k: 3}), [1, 1, 1]);
assert.strictEqual(mt.uniform(5), 0.8400239504408091);
assert.deepStrictEqual(mt.shuffled([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
mt.seed = 1234;
assert.strictEqual(mt.uniform(5, 7), 5.267587215639651);
mt.seed = 1234;
assert.strictEqual(mt.uniform(7, 5), 6.732412784360349);
mt.seed = 1234;
assert.strictEqual(mt.random(), 0.1337936078198254, "Reseeding doesn't give the same state as passing the seed to the constructor");
mt.seed = "frehtjdfhdffvd"; // Reseeding with a string

// Park-Miller algorithm
const pm = new RNG.PM(1234);
assert.strictEqual(pm.random(), 0.009657739666131204);
assert.strictEqual(pm.randRange(1, 2087), 663);
assert.strictEqual(pm.choice([1, 2, 3, 4, 5]), 3);
assert.deepStrictEqual(pm.choices([1, 2, 3, 4, 5], {k: 3}), [5, 3, 1]);
assert.strictEqual(pm.uniform(5), 0.26528204337939715);
assert.deepStrictEqual(pm.shuffled([1, 2, 3, 4, 5]), [4, 2, 3, 1, 5]);
pm.seed = 1234;
assert.strictEqual(pm.uniform(5, 7), 5.0193154793322625);
pm.seed = 1234;
assert.strictEqual(pm.uniform(7, 5), 6.9806845206677375);
pm.seed = 1234;
assert.strictEqual(pm.random(), 0.009657739666131204, "Reseeding doesn't give the same state as passing the seed to the constructor");
pm.seed = "frehtjdfhdffvd"; // Reseeding with a string
