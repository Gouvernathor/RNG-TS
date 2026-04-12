/**
 * The constructor should take one single optional string or number parameter, as a seed
 * to be set with the seed setter.
 * (This can't be represented in an abstract class.)
 * The seed property is set-only, it can't be read except on particular subclasses.
 * (A limitation of TypeScript makes that limitation not visible in the type system.)
 */
export default abstract class AbstractRNG {
    abstract random(): number;
    abstract set seed(seed: number | string | undefined);

    /**
     * @returns a number in:
     * - [0, a[ if only one parameter is provided
     * - [a, b[ if a <= b
     * - ]b, a] if a > b
     */
    uniform(a: number, b?: number): number {
        if (b === undefined) {
            return this.random() * a;
        }
        return a + this.random() * (b - a);
    }

    /**
     * @returns a number in [[min, max[[
     */
    randRange(max: number): number;
    randRange(min: number, max: number): number;
    randRange(min: number, max?: number): number {
        return Math.floor(this.uniform(min, max));
    }

    /**
     * Generates a number able to be used as a seed to another RNG.
     * This is more recommended than using the other methods to generate seeds,
     * as the value will be more evenly spread.
     */
    randSeed() {
        return this.randRange(0xffffffff);
    }

    /**
     * @returns one of the elements
     */
    choice<T>(array: readonly T[]): T {
        return array[this.randRange(0, array.length)]!;
    }

    /**
     * Warning: this generator is infinite.
     * It reseeds at every generation.
     * Returns values between 0 (inclusive) and the length of the weights array (exclusive).
     */
    *weightedIndexChoicesGenerator(weights: readonly number[]): Generator<number> {
        let accu = 0;
        const cumWeights = weights.map(w => (accu += w));
        const maxCumWeight = cumWeights[cumWeights.length - 1]!;
        while (true) {
            const rand = this.uniform(maxCumWeight);
            yield cumWeights.findIndex(w => w > rand);
        }
    }

    /**
     * Warning: this generator is infinite.
     * It reseeds at every generation.
     * The two parameters must be the same length.
     */
    *weightedChoicesGenerator<T>(array: readonly T[], weights: readonly number[]): Generator<T> {
        for (const i of this.weightedIndexChoicesGenerator(weights)) {
            yield array[i]!;
        }
    }

    /**
     * Picks k elements from the array with replacement.
     * This reseeds k times, not 1 time.
     * @param k number of elements to choose
     * @param weights if provided, the probability of each element to be chosen
     */
    choices<T>(array: readonly T[], { k, weights }: { k: number, weights?: readonly number[] }): T[] {
        if (weights === undefined) {
            return Array.from({length: k}, () => this.choice(array));
        } else {
            const gen = this.weightedChoicesGenerator(array, weights);
            return Array.from({length: k}, () => gen.next().value!);
        }
    }

    /**
     * @param maxLen the number of elements to return, defaults to the length of the input
     * @returns an array with the same elements in random order (without replacement)
     */
    shuffled<T>(input: Iterable<T>, maxLen?: number): T[] {
        const copy = [...input];
        maxLen ??= copy.length;
        return Array.from({length: maxLen}, () => copy.splice(this.randRange(copy.length), 1)[0]!);
    }
}
