const _624 = 624;

export class MersenneTwisterStateHolder {
    private index!: i16;
    private readonly state: StaticArray<u32> = new StaticArray<u32>(_624);

    constructor(seed: u32) {
        this.seed = seed;
    }

    set seed(seed: u32) {
        this.index = 0;

        const state = this.state;
        state[0] = seed;

        for (let i: i16 = 1; i < _624; i++) {
            state[i] = ((state[i-1] ^ (state[i-1] >>> 30)
                        * 0x6c078965) + i); // 1812433253
        }
    }

    random(): f64 {
        const state = this.state;
        if (this.index >= _624) {
            for (let i: i16 = 0; i < _624; i++) {
                // Bit 31 (32nd bit) of state[i]
                const y: u32 = (state[i] & 0x80000000)
                // Bits 0-30 (first 31 bits) of state[...]
                      + (state[(i+1) % _624] & 0x7fffffff);
                // The new pseudo random number
                state[i] = state[(i + 397) % _624] ^ (y >>> 1);
                if (y % 2 !== 0) { // y is odd
                    state[i] ^= 0x9908b0df; // 2567483615
                }
            }
            this.index = 0;
        }

        let y: u32 = state[this.index++];

        y ^= y >>> 11;
        y ^= (y << 7) & 0x9d2c5680; // 2636928640
        y ^= (y << 15) & 0xefc60000; // 4022730752
        y ^= y >>> 18;

        return y / f64(4294967296); // 2**32
    }
}
