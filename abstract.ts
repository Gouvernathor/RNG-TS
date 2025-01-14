/**
 * The constructor should take one single optional string or number parameter, as a seed
 * to be set with the seed setter.
 * (This can't be represented in an abstract class.)
 */
export default abstract class AbstractRNG {
    abstract random(): number;
    abstract set seed(seed: number | string | undefined);

    /**
     * @returns a number in [[min, max[[
     */
    randRange(max: number): number;
    randRange(min: number, max: number): number;
    randRange(min: number, max?: number): number {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.floor(this.random() * (max - min));
    }
    /**
     * @returns one of the elements
     */
    choice<T>(array: ReadonlyArray<T>) {
        return array[this.randRange(0, array.length)];
    }
    /**
     * Warning: this generator is infinite.
     * It reseeds at every generation.
     */
    *weightedChoicesGenerator<T>(array: ReadonlyArray<T>, weights: ReadonlyArray<number>) {
        let accu = 0;
        const cumWeights = weights.map(w => (accu += w));
        const maxCumWeight = cumWeights[cumWeights.length - 1];
        while (true) {
            const rand = this.random() * maxCumWeight;
            const idx = cumWeights.findIndex(w => w > rand);
            yield array[idx];
        }
    }
    /**
     * Picks k elements from the array with replacement.
     * This reseeds k times, not 1 time.
     * @param k number of elements to choose
     * @param weights if provided, the probability of each element to be chosen
     */
    choices<T>(array: ReadonlyArray<T>, { k, weights }: { k: number, weights?: ReadonlyArray<number> }): T[] {
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
        if (maxLen === undefined) {
            maxLen = copy.length;
        }
        return Array.from({length: maxLen}, () => copy.splice(this.randRange(0, copy.length), 1)[0]);
    }
}
