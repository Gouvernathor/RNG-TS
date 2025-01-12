import AbstractRNG from "./abstract";
import hashString from "./hashString";
import MersenneTwister from "./lib/mersenne-twister";
import ParkMiller from "./lib/park-miller";
export { MersenneTwister, ParkMiller };

const M = 0x80000000; // 2**31
const A = 1103515245;
const C = 12345;

/**
 * Deterministic and reseedable RNG with utility methods
 */
export default class RNG extends AbstractRNG {
    #state!: number;
    /**
     * @param seed integer between 0 and 2^31 - 1 ; if not passed, generates it from Math.random()
     */
    constructor(seed?: number | string) {
        super();
        this.seed = seed;
    }
    /**
     * @param seed integer between 0 and 2^31 - 1 ; if undefined, generates it from Math.random()
     */
    set seed(seed: number | string | undefined) {
        if (seed === undefined) {
            this.#state = Math.floor(Math.random() * (M - 1));
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
        this.#state = (A * this.#state + C) % M;
        return this.#state;
    }
    /**
     * @returns a number in [0, 1[
     */
    random() {
        return this.randInt() / M;
    }

    static MT = MersenneTwister;
    static PM = ParkMiller;
}
