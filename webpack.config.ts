import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Configuration } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEV_PORT = 8080;

const devServerConfig: DevServerConfiguration = {
  hot: false,
  port: DEV_PORT,
};

const config: Configuration = {
  name: "iframe_sdk_embed_v1",

  entry: {
    // Browser standalone script (kept for backward compatibility).
    embed: path.resolve(
      __dirname,
      "src/frontend/src/metabase/embedding/embedding-iframe-sdk/embed.ts",
    ),
    // Public npm API.
    loader: path.resolve(__dirname, "src/loader.ts"),
  },

  output: {
    path: path.resolve(process.cwd(), "dist/metabase"),
    filename: "[name].js",
    library: {
      type: "umd",
      name: ["metabase", "embed"],
    },
    globalObject: "this",
    clean: false,
  },

  devServer: devServerConfig,

  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              loose: true,
              parser: { syntax: "typescript" },
            },
            sourceMaps: false,
            minify: false,
            env: { targets: ["defaults"] },
          },
        },
        type: "javascript/auto",
      },
    ],
  },

  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },

  devtool: false,

  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: {
      "embedding-sdk-bundle": path.resolve(
        __dirname,
        "src/frontend/src/embedding-sdk-bundle",
      ),
      "embedding-sdk-shared": path.resolve(
        __dirname,
        "src/frontend/src/embedding-sdk-shared",
      ),
      metabase: path.resolve(__dirname, "src/frontend/src/metabase"),
      "metabase-types": path.resolve(
        __dirname,
        "src/frontend/src/metabase-types",
      ),
      "sdk-iframe-embedding-script-ee-plugins": path.resolve(
        __dirname,
        "src/frontend/src/metabase/plugins/noop",
      ),
    },
  },
};

export default config;