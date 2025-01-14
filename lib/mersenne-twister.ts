import AbstractRNG from "../abstract";
import hashString from "../hashString";

// magics
const _624 = 624;
const _397 = 397;

export default class MersenneTwister extends AbstractRNG {
    #index!: number;
    readonly #state: number[] = Array(_624);

    constructor(seed?: number|string) {
        super();
        this.seed = seed;
    }

    set seed(seed: number | string | undefined) {
        if (typeof seed === "string") {
            seed = hashString(seed);
        }

        this.#index = 0;

        const state = this.#state;

        state[0] = seed === undefined ?
            Math.floor(Math.random() * 0xffffffff) | 0 :
            seed;

        for (let i = 1; i < _624; i++) {
            state[i] = state[i-1] ^ (state[i-1] >>> 30);
            state[i] = 0x6c078965 * state[i] + i; // 1812433253
            state[i] = state[i] & ((state[i] << 32) - 1);
        }
    }

    #generateNumbers() {
        const state = this.#state;
        for (let i = 0; i < _624; i++) {
            // Bit 31 (32nd bit) of state[i]
            let y = (state[i] & 0x80000000);
            // Bits 0-30 (first 31 bits) of state[...]
            y += (state[(i+1) % _624] & 0x7fffffff);
            // The new pseudo random number
            state[i] = state[(i + _397) % _624] ^ (y >>> 1);
            if (y % 2 !== 0) { // y is odd
                state[i] ^= 0x9908b0df; // 2567483615
            }
        }
    }

    random() {
        if (this.#index === 0) {
            this.#generateNumbers();
        }

        let y = this.#state[this.#index];

        y ^= y >>> 11;
        y ^= (y << 7) & 0x9d2c5680; // 2636928640
        y ^= (y << 15) & 0xefc60000; // 4022730752
        y ^= y >>> 18;

        this.#index = (this.#index + 1) % _624;

        return (y >>> 0) * (1.0 / 4294967296.0);
    }
}
