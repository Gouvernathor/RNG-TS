import AbstractRNG from "../abstract";
import hashString from "../hashString";

export default class ParkMiller extends AbstractRNG {
    #seed!: number;

    constructor(seed?: number|string) {
        super();
        this.seed = seed;
    }

    set seed(seed: number | string | undefined) {
        if (seed === undefined) {
            seed = 1;
        } else if (typeof seed === "string") {
            seed = hashString(seed);
        }
        this.#seed = seed;
    }

    random() {
        const hi = 16807 * (this.#seed >> 16);
        const lo = 16807 * (this.#seed & 0xffff) + ((hi & 0x7fff) << 16) + (hi >> 15);

        this.#seed = (lo > 0x7fffffff ? lo - 0x7fffffff : lo);

        return this.#seed / 0x7fffffff;
    }
}
