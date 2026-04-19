import AbstractBigIntRNG from "./abstract.js";
import Lehmer128BigIntRNG from "./lehmer.js";
import DefaultBigIntRNG from "./default.js";
import WellBigIntRNG from "./well.js";
import CryptoBigIntRNG from "./crypto.js";

export { Lehmer128BigIntRNG, DefaultBigIntRNG, WellBigIntRNG, CryptoBigIntRNG };
export type { AbstractBigIntRNG as AnyBigIntRNG };

export default class RNG extends WellBigIntRNG {
    static L128 = Lehmer128BigIntRNG;
    static D = DefaultBigIntRNG;
    static Well = WellBigIntRNG;
    static Crypto = CryptoBigIntRNG;
}
