import esbuildPluginTsc from "esbuild-plugin-tsc";

export function createBuildSettings(options) {
  return {
    entryPoints: ["src/main.ts"],
    outfile: "dist/figma.js",
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    plugins: [
      esbuildPluginTsc({
        force: true,
        forceEsm: true
      }),
    ],
    ...options,
  };
}
