export class ParkMillerStateHolder {
    private state!: u32;

    constructor(seed: u32) {
        this.seed = seed;
    }

    set seed(seed: u32) {
        this.state = seed;
    }

    random(): f64 {
        const hi = 16807 * (this.state >> 16);
        const lo = 16807 * (this.state & 0xffff) + ((hi & 0x7fff) << 16) + (hi >> 15);

        this.state = (lo > 0x7fffffff ? lo - 0x7fffffff : lo);

        return f64(this.state) / 0x7fffffff;
    }
}
