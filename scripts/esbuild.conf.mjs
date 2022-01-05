import esbuild from "esbuild";
import { opendir } from "fs/promises";
import nodemon from "nodemon";
import { join } from "path";
import { fileURLToPath, URL } from "url";

async function* scan(path, cb) {
  const dir = await opendir(path);

  for await (const item of dir) {
    const file = join(dir.path, item.name);
    if (item.isFile()) {
      if (cb(file)) yield file;
    } else if (item.isDirectory()) {
      yield* scan(file, cb);
    }
  }
}

export async function build(watch = false) {
  console.log("watching", watch);
  const rootFolder = new URL("../", import.meta.url);
  const distFolder = new URL("dist/", rootFolder);
  const srcFolder = new URL("src/", rootFolder);

  await Promise.all([
    esbuild.build({
      logLevel: "info",
      entryPoints: [
        "src/index.ts",
        "src/deploy-commands.ts",
        "src/remove-commands.ts",
      ],
      bundle: true,
      format: "cjs",
      splitting: process.env.NODE_ENV === "production",
      write: true,
      outdir: fileURLToPath(distFolder),
      platform: "node",
      tsconfig: join(fileURLToPath(rootFolder), "tsconfig.json"),
      watch: watch
        ? {
            onRebuild(err, _result) {
              if (err) {
                console.error(err);
                process.exit(1);
              }
              nodemon.restart();
            },
          }
        : false,
      incremental: watch,
      sourcemap: true,
      external: [],
      minify: process.env.NODE_ENV === "production",
    }),
    watch
      ? nodemon({ exec: "yarn start", nodeArgs: ["--enable-source-maps"] })
      : Promise.resolve(),
  ]);
}
