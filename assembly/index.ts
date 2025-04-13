// Version without mixin or abstract base class
// and where mixin methods are in TS/JS
import { MersenneTwisterStateHolder } from "./mersenne-twister";
import { ParkMillerStateHolder } from "./park-miller";

const M: u32 = 0x80000000; // 2**31
const A: u32 = 1103515245;
const C: u32 = 12345;

// RNG state object
class RNGStateHolder {
    private state!: u32;

    constructor(seed: u32) {
        this.seed = seed;
    }

    set seed(seed: u32) {
        this.state = seed;
    }

    randInt(): u32 {
        return this.state = (A * this.state + C) % M;
    }

    random(): f64 {
        return f64(this.randInt()) / M;
    }
}
// RNG instantiator function
export function RNGnew(seed: u32): RNGStateHolder {
    return new RNGStateHolder(seed);
}
// RNG seeder function
export function RNGseed(rng: RNGStateHolder, seed: u32): void {
    rng.seed = seed;
}
// (RNG randInt function)
// RNG random function
export function RNGrandom(rng: RNGStateHolder): f64 {
    return rng.random();
}

// MT state object
// (imported)
// MT instantiator function
export function MTnew(seed: u32): MersenneTwisterStateHolder {
    return new MersenneTwisterStateHolder(seed);
}
// MT seeder function
export function MTseed(mt: MersenneTwisterStateHolder, seed: u32): void {
    mt.seed = seed;
}
// MT random function
export function MTrandom(mt: MersenneTwisterStateHolder): f64 {
    return mt.random();
}

// PM state object
// (imported)
// PM instantiator function
export function PMnew(seed: u32): ParkMillerStateHolder {
    return new ParkMillerStateHolder(seed);
}
// PM seeder function
export function PMseed(pm: ParkMillerStateHolder, seed: u32): void {
    pm.seed = seed;
}
// PM random function
export function PMrandom(pm: ParkMillerStateHolder): f64 {
    return pm.random();
}
