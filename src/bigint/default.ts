import AbstractBigIntRNG, { makeRandom } from "./abstract.js";
import { hashNumber, hashString } from "./hash.js";

const M = 0x80000000n; // 2**31
const Mnumber = Number(M);
const A = 1103515245n;
const C = 12345n;

export default class DefaultBigIntRNG extends AbstractBigIntRNG {
    #state!: bigint;

    constructor(seed?: bigint|number|string) {
        super();
        this.seed = seed;
    }

    set seed(seed: bigint|number|string|undefined) {
        if (seed === undefined) {
            seed = BigInt(Math.floor(Math.random() * (Mnumber - 1)));
        } else if (typeof seed === "string") {
            seed = hashString(seed);
        } else if (typeof seed === "number") {
            seed = hashNumber(seed);
        }

        this.#state = seed < 0 ? -seed : seed;
    }

    #next() {
        return this.#state = (A * this.#state + C) % M;
    }

    override random = makeRandom({
        next: this.#next.bind(this),
        nBitsFromNext: 31n,
    });
}
