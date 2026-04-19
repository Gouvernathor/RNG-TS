import { Fraction } from "@gouvernathor/fraction.ts";
import AbstractBigIntRNG from "./abstract";

/**
 * Uses the web-standard Crypto object to generate random values.
 * NOT SEEDABLE NOR DETERMINISTIC.
 */
export default class CryptoBigIntRNG extends AbstractBigIntRNG {
    override random(resolution = this.resolution): Fraction {
        const requestedNBits = resolution.toString(16).length * 4;

        const length = Math.ceil(requestedNBits / 64);

        // dont't keep the array referenced
        const numerator = crypto.getRandomValues(new BigUint64Array(length))
            .reduce((prev, curr) => (prev << 64n) + curr);

        const denominator = 2n ** (64n * BigInt(length));

        return Fraction.fromPair(numerator, denominator);
    }

    override set seed(_seed: string | number | bigint | undefined) {
        console.error("Seeding is not supported with this generator.");
    }
}
