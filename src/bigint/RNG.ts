import AbstractBigIntRNG from "./abstract.js";
import Lehmer128BigIntRNG from "./lehmer.js";
import DefaultBigIntRNG from "./default.js";
import WellBigIntRNG from "./well.js";

export { Lehmer128BigIntRNG, DefaultBigIntRNG, WellBigIntRNG };
export type { AbstractBigIntRNG as AnyBigIntRNG };

export default class RNG extends WellBigIntRNG {
    static L128 = Lehmer128BigIntRNG;
    static D = DefaultBigIntRNG;
    static W = WellBigIntRNG;
}
