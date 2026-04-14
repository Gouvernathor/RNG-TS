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

const mt = Array<bigint>(N);
let mti = Number(N)+1;

let genRandInt32;


/* do not use this function directly */
/* initializes mt[N] with a seed */
function init_genrand(s: bigint) {
    mt[0]= s & 0xffffffffn;
    for (mti=1; mti<N; mti++) {
        mt[mti] =
	    (1812433253n * (mt[mti-1]! ^ (mt[mti-1]! >> 30n)) + BigInt(mti));
        /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
        /* In the previous versions, MSBs of the seed affect   */
        /* only MSBs of the array mt[].                        */
        /* 2002/01/09 modified by Makoto Matsumoto             */
        mt[mti]! &= 0xffffffffn;
        /* for >32 bit machines */
    }
	mti = 0;
	genRandInt32 = case1;
}

/* initialize by an array with array-length */
/* init_key is the array for initializing keys */
/* key_length is its length */
/* slight change for C++, 2004/2/26 */
function init_by_array(init_key: readonly bigint[], key_length: bigint) {
    let i, j, k: bigint;
    init_genrand(19650218n);
    i=1; j=0;
    k = (N>key_length ? N : key_length);
    for (; k; k--) {
        mt[i] = (mt[i]! ^ ((mt[i-1]! ^ (mt[i-1]! >> 30n)) * 1664525n))
          + init_key[j]! + BigInt(j); /* non linear */
        mt[i]! &= 0xffffffffn; /* for WORDSIZE > 32 machines */
        i++; j++;
        if (i>=N) { mt[0] = mt[numberN-1]!; i=1; }
        if (j>=key_length) j=0;
    }
    for (k=N-1n; k; k--) {
        mt[i] = (mt[i]! ^ ((mt[i-1]! ^ (mt[i-1]! >> 30n)) * 1566083941n))
          - BigInt(i); /* non linear */
        mt[i]! &= 0xffffffffn; /* for WORDSIZE > 32 machines */
        i++;
        if (i>=N) { mt[0] = mt[numberN-1]!; i=1; }
    }

    mt[0] = 0x80000000n; /* MSB is 1; assuring non-zero initial array */
	mti = 0;
	genRandInt32 = case1;
}

function case1(): bigint {
    mt[mti] = mt[mti+numberM]! ^ twist(mt[mti]!,mt[mti+1]!);
    let z: bigint = mt[mti]! ^ (mt[mti + LAG1]! & MASK1);
    z ^= TEMPERING_SHIFT_1(z);
    z ^= TEMPERING_SHIFT_2(z);
    z ^= (mt[mti + LAG2]! & MASK2);
    mti++;
    if(mti == numberN-numberM) genRandInt32 = case2;
    return z;
}

function case2(): bigint {
    mt[mti] = mt[mti+(numberM-numberN)]! ^ twist(mt[mti]!,mt[mti+1]!);
    let z: bigint = mt[mti]! ^ (mt[mti + LAG1]! & MASK1);
    z ^= TEMPERING_SHIFT_1(z);
    z ^= TEMPERING_SHIFT_2(z);
    z ^= (mt[mti + LAG2]! & MASK2);
    mti++;
    if(mti == LAG1over) genRandInt32 = case3;
    return z;
}

function case3(): bigint {
    mt[mti] = mt[mti+(numberM-numberN)]! ^ twist(mt[mti]!,mt[mti+1]!);
    let z: bigint = mt[mti]! ^ (mt[mti - LAG1over]! & MASK1);
    z ^= TEMPERING_SHIFT_1(z);
    z ^= TEMPERING_SHIFT_2(z);
    z ^= (mt[mti + LAG2]! & MASK2);
    mti++;
    if(mti == LAG2over) genRandInt32 = case4;
    return z;
}

function case4(): bigint {
    mt[mti] = mt[mti+(numberM-numberN)]! ^ twist(mt[mti]!,mt[mti+1]!);
    let z: bigint = mt[mti]! ^ (mt[mti - LAG1over]! & MASK1);
    z ^= TEMPERING_SHIFT_1(z);
    z ^= TEMPERING_SHIFT_2(z);
    z ^= (mt[mti - LAG2over]! & MASK2);
    mti++;
    if(mti==numberN-1)genRandInt32 = case5;
    return z;
}

function case5(): bigint {
    mt[numberN-1] = mt[numberM-1]! ^ twist(mt[numberN-1]!, mt[0]!);
    let z: bigint = mt[mti]! ^ (mt[mti - LAG1over]! & MASK1);
    z ^= TEMPERING_SHIFT_1(z);
    z ^= TEMPERING_SHIFT_2(z);
    z ^= (mt[mti - LAG2over]! & MASK2);
    mti=0;
    genRandInt32 = case1;
    return z;
}

export {};

// /* generates a random number on [0,0x7fffffff]-interval */
// unsigned int genrand_int31(void)
// {
//     return (unsigned int)(genRandInt32()>>1);
// }

// /* generates a random number on [0,1]-real-interval */
// double genrand_real1(void)
// {
//     return genRandInt32()*(1.0/4294967295.0);
//     /* divided by 2^32-1 */
// }

// /* generates a random number on [0,1)-real-interval */
// double genrand_real2(void)
// {
//     return genRandInt32()*(1.0/4294967296.0);
//     /* divided by 2^32 */
// }

// /* generates a random number on (0,1)-real-interval */
// double genrand_real3(void)
// {
//     return (((double)genRandInt32()) + 0.5)*(1.0/4294967296.0);
//     /* divided by 2^32 */
// }

// /* generates a random number on [0,1) with 53-bit resolution*/
// double genrand_res53(void)
// {
//     unsigned int a=genRandInt32()>>5, b=genRandInt32()>>6;
//     return(a*67108864.0+b)*(1.0/9007199254740992.0);
// }
// /* These real versions are due to Isaku Wada, 2002/01/09 added */

// int main(void)
// {
//     int i;
//     unsigned int init[4]={0x123n, 0x234n, 0x345n, 0x456n}, length=4;
//     init_by_array(init, length);
//     printf("1000 outputs of genRandInt32()\n");
//     for (i=0; i<1000; i++) {
//       printf("%10u ", genRandInt32());
//       if (i%5==4) printf("\n");
//     }
//     printf("\n1000 outputs of genrand_real2()\n");
//     for (i=0; i<1000; i++) {
//       printf("%10.8f ", genrand_real2());
//       if (i%5==4) printf("\n");
//     }
//     return 0;
// }
