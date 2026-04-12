export default function hashString(str: string): bigint {
    let hash = 0n;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5n) - hash) + BigInt(str.charCodeAt(i));
        hash &= 0xffffffffn;
    }
    return hash;
}
