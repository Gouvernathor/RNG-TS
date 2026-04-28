import { Fraction, FractionAble } from "@gouvernathor/fraction.ts";

export default abstract class AbstractBigIntRNG {
    /**
     * This is the default resolution value passed to the random method.
     * It defaults to 0, which is an invalid value.
     * You must either set this value on the random object,
     * or always pass an explicit resolution value when calling random.
     */
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
     * The generator will reseed the same number of times for the same requested resolution,
     * and the number of reseeds is increasing by the resolution.
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

    /**
     * @returns a Fraction in:
     * - [0, a[ if only one parameter is provided
     * - [a, b[ if a <= b
     * - ]b, a] if a > b
     * @param resolution the minimum number of values
     * having the same probability of being emitted.
     * Arbitrarily large.
     */
    uniform(resolution: bigint, a: FractionAble, b?: FractionAble): Fraction {
        if (b !== undefined) {
            return this.uniform(resolution, Fraction.fromAny(b).sub(a)).add(a);
        }

        return this.random(resolution).mul(a);
    }

    /**
     * Warning: this generator is infinite.
     * It reseeds at every generation.
     * Returns values between 0 (inclusive) and the length of the weights array (exclusive).
     */
    *weightedIndexChoicesGenerator(weightedArray: readonly bigint[]): Generator<number> {
        let accu = 0n;
        const cumWeights = weightedArray.map(w => (accu += w));
        const maxCumWeight = cumWeights[cumWeights.length - 1]!;
        while (true) {
            const rand = this.randRange(maxCumWeight);
            yield cumWeights.findIndex(w => w > rand);
        }
    }

    /**
     * Picks k elements from the array with replacement.
     * This reseeds k times, not 1 time.
     * @param k number of elements to choose
     */
    weightedChoices<T>(weightedArray: readonly (readonly [T, bigint])[], k: number): T[] {
        const gen = this.weightedIndexChoicesGenerator(weightedArray.map(([_, w]) => w));
        return Array.from({ length: k }, () => weightedArray[gen.next().value!]![0]);
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
        return Array.from({length: maxLen}, () => copy.splice(Number(this.randRange(BigInt(copy.length))), 1)[0]!);
    }
}

export interface RandomMethod {
    (this: AbstractBigIntRNG, resolution?: bigint): Fraction;
}

/**
 * Facilitates the creation of the function named random in the abstract class.
 * It must be passed a function (presumably a bound method)
 * generating a bigint with a fixed number of bits,
 * and that number of bits.
 */
export function makeRandom({
    next,
    nBitsFromNext,
}: {
    next: () => bigint,
    nBitsFromNext: bigint,
}): RandomMethod {
    const numberBitsOfNext = Number(nBitsFromNext);

    // the number of bits required to store the requested resolution
    const getRequestedNumberOfBits = numberBitsOfNext % 4 === 0 ?
        (resolution: bigint) =>
            // this rounds up to the higher multiple of 4, but we're rounding by a multiple of 4 afterwards
            // (allegedly faster than .toString(2))
            resolution.toString(16).length * 4 :
        (resolution: bigint) =>
            resolution.toString(2).length;

    return function random(this: AbstractBigIntRNG, resolution = this.resolution) {
        if (resolution <= 0n) {
            throw new Error("the resolution must be a strictly positive value");
        }

        const requestedNBits = getRequestedNumberOfBits(resolution);

        const numberOfNextCalls = Math.ceil(requestedNBits / numberBitsOfNext);

        let numerator = 0n;
        for (let i = 0; i < numberOfNextCalls; i++) {
            numerator = (numerator << nBitsFromNext) + next();
        }

        // the denominator is 2** (nBitsFromNext * the number of times #next was called)
        const denominator = 2n ** (nBitsFromNext * BigInt(numberOfNextCalls));

        return Fraction.fromPair(numerator, denominator);
    };
}
