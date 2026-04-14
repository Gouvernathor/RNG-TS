import AbstractBigIntRNG, { makeRandom } from "./abstract.js";
import { hashNumber, hashString } from "./hash.js";

// reference : https://www.ritsumei.ac.jp/~harase/memt19937-II.c

const N = 624n;
const numberN = Number(N);
const M = 397n;
const numberM = Number(M);
const MATRIX_A =  0x9908b0dfn; /* constant vector a */
const UPPER_MASK = 0x80000000n; /* most significant w-r bits */
const LOWER_MASK = 0x7fffffffn; /* least significant r bits */

const mixBits = (u: bigint, v: bigint) => ((u) & UPPER_MASK) | ((v) & LOWER_MASK);
const twist = (u: bigint, v: bigint) => ((mixBits(u, v) >> 1n) ^ ((v) & 1n ? MATRIX_A : 0n));

const LAG1 = 151;
const LAG2 = 36;
const LAG1over = 473;
const LAG2over = 588;
const TEMPERING_SHIFT_1 = (z: bigint) => z << 8n;
const TEMPERING_SHIFT_2 = (z: bigint) => z << 14n;
const MASK1 = 0xb219beabn;
const MASK2 = 0x56bde52an;

class WellBigIntBase {
    private readonly mt = Array<bigint>(N);
    private mti = Number(N)+1;

    private genRandInt32!: () => bigint;

    constructor(initArray: readonly bigint[]) {
        this.init_by_array(initArray);
    }

    /* do not use this function directly */
    /* initializes mt[N] with a seed */
    private init_genrand(s: bigint) {
        this.mt[0]= s & 0xffffffffn;
        for (this.mti=1; this.mti<N; this.mti++) {
            this.mt[this.mti] =
            (1812433253n * (this.mt[this.mti-1]! ^ (this.mt[this.mti-1]! >> 30n)) + BigInt(this.mti));
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array mt[].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            this.mt[this.mti]! &= 0xffffffffn;
            /* for >32 bit machines */
        }
        this.mti = 0;
        this.genRandInt32 = this.case1;
    }

    /* initialize by an array with array-length */
    /* init_key is the array for initializing keys */
    /* key_length is its length */
    /* slight change for C++, 2004/2/26 */
    init_by_array(init_key: readonly bigint[]) {
        const keyLength = init_key.length;
        let i=1, j=0, k: bigint;
        this.init_genrand(19650218n);
        k = (N>keyLength ? N : BigInt(keyLength));
        for (; k; k--) {
            this.mt[i] = (this.mt[i]! ^ ((this.mt[i-1]! ^ (this.mt[i-1]! >> 30n)) * 1664525n))
              + init_key[j]! + BigInt(j); /* non linear */
            this.mt[i]! &= 0xffffffffn;
            i++; j++;
            if (i>=N) { this.mt[0] = this.mt[numberN-1]!; i=1; }
            if (j>=keyLength) j=0;
        }
        for (k=N-1n; k; k--) {
            this.mt[i] = (this.mt[i]! ^ ((this.mt[i-1]! ^ (this.mt[i-1]! >> 30n)) * 1566083941n))
              - BigInt(i); /* non linear */
            this.mt[i]! &= 0xffffffffn;
            i++;
            if (i>=N) { this.mt[0] = this.mt[numberN-1]!; i=1; }
        }

        this.mt[0] = 0x80000000n; /* MSB is 1; assuring non-zero initial array */
        this.mti = 0;
        this.genRandInt32 = this.case1;
    }

    private case1(): bigint {
        this.mt[this.mti] = this.mt[this.mti+numberM]! ^ twist(this.mt[this.mti]!,this.mt[this.mti+1]!);
        let z: bigint = this.mt[this.mti]! ^ (this.mt[this.mti + LAG1]! & MASK1);
        z ^= TEMPERING_SHIFT_1(z);
        z ^= TEMPERING_SHIFT_2(z);
        z ^= (this.mt[this.mti + LAG2]! & MASK2);
        this.mti++;
        if(this.mti == numberN-numberM) this.genRandInt32 = this.case2;
        return z;
    }

    private case2(): bigint {
        this.mt[this.mti] = this.mt[this.mti+(numberM-numberN)]! ^ twist(this.mt[this.mti]!,this.mt[this.mti+1]!);
        let z: bigint = this.mt[this.mti]! ^ (this.mt[this.mti + LAG1]! & MASK1);
        z ^= TEMPERING_SHIFT_1(z);
        z ^= TEMPERING_SHIFT_2(z);
        z ^= (this.mt[this.mti + LAG2]! & MASK2);
        this.mti++;
        if(this.mti == LAG1over) this.genRandInt32 = this.case3;
        return z;
    }

    private case3(): bigint {
        this.mt[this.mti] = this.mt[this.mti+(numberM-numberN)]! ^ twist(this.mt[this.mti]!,this.mt[this.mti+1]!);
        let z: bigint = this.mt[this.mti]! ^ (this.mt[this.mti - LAG1over]! & MASK1);
        z ^= TEMPERING_SHIFT_1(z);
        z ^= TEMPERING_SHIFT_2(z);
        z ^= (this.mt[this.mti + LAG2]! & MASK2);
        this.mti++;
        if(this.mti == LAG2over) this.genRandInt32 = this.case4;
        return z;
    }

    private case4(): bigint {
        this.mt[this.mti] = this.mt[this.mti+(numberM-numberN)]! ^ twist(this.mt[this.mti]!,this.mt[this.mti+1]!);
        let z: bigint = this.mt[this.mti]! ^ (this.mt[this.mti - LAG1over]! & MASK1);
        z ^= TEMPERING_SHIFT_1(z);
        z ^= TEMPERING_SHIFT_2(z);
        z ^= (this.mt[this.mti - LAG2over]! & MASK2);
        this.mti++;
        if(this.mti==numberN-1)this.genRandInt32 = this.case5;
        return z;
    }

    private case5(): bigint {
        this.mt[numberN-1] = this.mt[numberM-1]! ^ twist(this.mt[numberN-1]!, this.mt[0]!);
        let z: bigint = this.mt[this.mti]! ^ (this.mt[this.mti - LAG1over]! & MASK1);
        z ^= TEMPERING_SHIFT_1(z);
        z ^= TEMPERING_SHIFT_2(z);
        z ^= (this.mt[this.mti - LAG2over]! & MASK2);
        this.mti=0;
        this.genRandInt32 = this.case1;
        return z;
    }

    // returns 31 bits
    next() {
        return this.genRandInt32() >> 1n;
    }
}

export default class WellBigIntRNG extends AbstractBigIntRNG {
    private readonly well: WellBigIntBase;

    override readonly random;

    constructor(seed?: bigint|number|string) {
        super();
        const array = this.hashSeed(seed);
        this.well = new WellBigIntBase(array);

        this.random = makeRandom({
            next: this.well.next.bind(this.well),
            nBitsFromNext: 31n,
        });
    }

    set seed(seed: bigint|number|string|undefined) {
        const array = this.hashSeed(seed);
        this.well.init_by_array(array);
    }

    private hashSeed(seed: bigint|number|string|undefined): bigint[] {
        if (seed === undefined) {
            seed = BigInt(Math.floor(Math.random() * 0x1fffffffffffff));
        } else if (typeof seed === "string") {
            seed = hashString(seed);
        } else if (typeof seed === "number") {
            seed = hashNumber(seed);
        }

        if (seed < 0) {
            seed = -seed;
        }

        const array = [];
        do {
            array.push(BigInt.asUintN(16, seed));
            seed >>= 16n;
        } while (seed);

        return array;
    }
}
