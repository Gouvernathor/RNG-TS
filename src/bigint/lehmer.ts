/**
 * This is a 128-bit Lehmer process, of which Park-Miller is a variant.
 */

import AbstractRNG, { makeRandom } from "./abstract.js";
import { hashNumber, hashString } from "./hash.js";

export default class Lehmer128BigInt extends AbstractRNG {
    #state!: bigint;

    constructor(seed?: number|string) {
        super();
        this.seed = seed;
    }

    override set seed(seed: string | number | bigint | undefined) {
        if (seed === undefined) {
            seed = BigInt(Math.floor(Math.random() * 0xffffffff));
        } else if (typeof seed === "string") {
            seed = hashString(seed);
        } else if (typeof seed === "number") {
            seed = hashNumber(seed);
        }

        // the state must be seeded with an odd value
        this.#state = seed << 1n | 1n;
    }

    #next() {
        const mult = 0x12e15e35_b500f16e_2e714eb2_b37916a5n;
        // truncate to 128 bits to prevent memory leak and to ensure validity of the return value
        this.#state = BigInt.asUintN(128, this.#state * mult);
        return this.#state >> 64n;
    }

    override random = makeRandom({
        next: this.#next.bind(this),
        nBitsOfNext: 64n,
    });
}
