import {defineConfig} from 'tsup';

export default defineConfig({
    entry: ["src/RNG.ts"],
    format: "esm",
    dts: true,
    sourcemap: true,
    clean: true,
});
