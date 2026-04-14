import { Fraction } from "@gouvernathor/fraction.ts";

export function hashString(str: string): bigint {
    let hash = 0n;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5n) - hash) + BigInt(str.charCodeAt(i));
        hash &= 0xffffffffn;
    }
    return hash;
}

export function hashFraction(fract: Fraction) {
    return fract.numerator ^ fract.denominator;
}

export function hashNumber(n: number) {
    return hashFraction(Fraction.fromNumeric(n));
}
