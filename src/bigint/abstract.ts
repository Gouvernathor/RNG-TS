import { Fraction } from "@gouvernathor/fraction.ts";

/**
 * TODO
 * how to make this work:
 * instead of using one reseed to generate a single value of x significant bits,
 * use as many reseeds as necessary to generate the required number of bits
 * for the requested (minimal) resolution.
 * This breaks the guarantee of a constant number of reseeds for each method call,
 * though it is now proportional to the resolution (or to the span for randrange).
 * It should remain proportional to the number of values for choice(s).
 *
 * Use a resolution setter ?
 * and default random()'s parameter to it ?
 * Defaults to 0, and that throws an error in random()
 * saying that it must be strictly positive.
 * Do that at the end, removing the resolution parameter to all the other methods,
 * and for those that call random() several times and also pass a resolution through,
 * document what the resolution is relative to.
 *
 * OR have randRange(one parameter) be the root function ??
 * no, because if the requested number and the reseed max value are coprimes,
 * it can be hard and slow to reconcile them.
 * (and both not generate some values more frequently than others,
 * and also not generate bigger numbers than expected.)
 * Whereas it makes no sense to complain that your fraction is more precise than you asked,
 * as long as its value is in the expected range.
 */
export default abstract class AbstractBigIntRNG {
    /**
     * Must return a Fraction value between 0 and 1;
     * which means that the numerator is positive and inferior to the denominator.
     * @param resolution a minimum value for the maximum value of the denominator.
     * The minimum number of different values
     * having the same probability of being emitted.
     * (Fraction need not be emitted in irreducible form.)
     */
    abstract random(resolution?: bigint): Fraction;
    abstract set seed(seed: number|bigint|string|undefined);

    /**
     * @returns a bigint in [[min, max[[
     */
    randRange(max: bigint): bigint;
    randRange(min: bigint, max: bigint): bigint;
    randRange(req: bigint, maxx?: bigint): bigint {
        if (maxx !== undefined) {
            if (req >= maxx) {
                throw new Error("Parameter value violation");
            }
            return this.randRange(maxx-req) + req;
        }
        if (req < 0) {
            return -this.randRange(req);
        }

        return this.random(req).mul(req).floor();
    }

    // TODO a version taking Fraction as inputs ?
    /**
     * @returns a Fraction in:
     * - [0, a[ if only one parameter is provided
     * - [a, b[ if a <= b
     * - ]b, a] if a > b
     * @param resolution the minimum number of values
     * having the same probability of being emitted.
     * Arbitrarily large.
     */
    uniform(resolution: bigint, a: bigint, b?: bigint): Fraction {
        if (b !== undefined) {
            return this.uniform(resolution, b-a).add(a);
        }

        return Fraction.fromPair(this.randRange(a * resolution), resolution);
    }

    /**
     * @returns one of the elements
     */
    choice<T>(array: readonly T[]): T {
        return array[Number(this.randRange(BigInt(array.length)))]!;
    }
}
