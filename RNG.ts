import { AbstractRNG } from "./abstract";
import hashString from "./hashString";
import { MersenneTwister } from "./lib/mersenne-twister";
export { MersenneTwister };

/**
 * Deterministic and reseedable RNG with utility methods
 */
export default class RNG extends AbstractRNG {
    readonly #m: number;
    readonly #a: number;
    readonly #c: number;
    #state!: number;
    /**
     * @param seed integer between 0 and 2^31 - 1 ; if not passed, generates it from Math.random()
     */
    constructor(seed?: number | string) {
        super();
        // LCG using GCC's constants
        this.#m = 0x80000000; // 2**31;
        this.#a = 1103515245;
        this.#c = 12345;

        this.seed = seed;
    }
    /**
     * @param seed integer between 0 and 2^31 - 1 ; if undefined, generates it from Math.random()
     */
    set seed(seed: number | string | undefined) {
        if (seed === undefined) {
            this.#state = Math.floor(Math.random() * (this.#m - 1));
        } else {
            if (typeof seed === "string") {
                seed = hashString(seed);
            }
            this.#state = Math.abs(seed);
        }
    }
    /**
     * @returns a number presumably in [[0, 2**31[[
     */
    randInt() {
        this.#state = (this.#a * this.#state + this.#c) % this.#m;
        return this.#state;
    }
    /**
     * @returns a number in [0, 1[
     */
    random() {
        return this.randInt() / this.#m;
    }

    static MT = MersenneTwister;
}
