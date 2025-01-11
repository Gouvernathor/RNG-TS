import {defineConfig} from 'tsup';

export default defineConfig({
    entry: ["RNG.ts"],
    format: "esm",
    dts: true,
    sourcemap: true,
    clean: true,
});
