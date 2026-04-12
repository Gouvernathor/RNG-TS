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
    resolution: bigint = 0n;

    /**
     * Must return a Fraction value between 0 and 1;
     * which means that the numerator is positive and inferior to the denominator.
     * @param resolution the minimum number of different values
     * having the same probability of being emitted.
     * A minimum value for the maximum value of the denominator.
     * (Fraction need not be emitted in irreducible form.)
     * Must default to the generator's resolution,
     * and throw on values not strictly positive.
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
     * Warning: this generator is infinite.
     * It reseeds at every generation.
     */
    *weightedChoicesGenerator<T>(weightedArray: readonly (readonly [T, bigint])[]): Generator<T> {
        let accu = 0n;
        const cumWeights = weightedArray.map(([_, w]) => (accu += w));
        const maxCumWeight = cumWeights[cumWeights.length - 1]!;
        while (true) {
            const rand = this.randRange(maxCumWeight);
            const idx = cumWeights.findIndex(w => w > rand);
            yield weightedArray[idx]![0];
        }
    }

    /**
     * Picks k elements from the array with replacement.
     * This reseeds k times, not 1 time.
     * @param k number of elements to choose
     */
    weightedChoices<T>(weightedArray: readonly (readonly [T, bigint])[], k: number): T[] {
        const gen = this.weightedChoicesGenerator(weightedArray);
        return Array.from({length: k}, () => gen.next().value!);
    }

    /**
     * This has no benefit compared to using a number (f64) -based RNG.
     * @returns one of the elements
     */
    choice<T>(array: readonly T[]): T {
        return array[Number(this.randRange(BigInt(array.length)))]!;
    }

    /**
     * This has no benefit compared to using a number (f64) -based RNG.
     * Picks k elements from the array with replacement.
     * This reseeds k times, not 1 time.
     * @param k number of elements to choose
     */
    choices<T>(array: readonly T[], k: number): T[] {
        return Array.from({length: k}, () => this.choice(array));
    }

    /**
     * This has no benefit compared to using a number (f64) -based RNG.
     * @param maxLen the number of elements to return, defaults to the length of the input
     * @returns an array with the same elements in random order (without replacement)
     */
    shuffled<T>(input: Iterable<T>, maxLen?: number): T[] {
        const copy = [...input];
        maxLen ??= copy.length;
        return Array.from({length: maxLen}, () => copy.splice(Number(this.randRange(0n, BigInt(copy.length))), 1)[0]!);
    }
}
