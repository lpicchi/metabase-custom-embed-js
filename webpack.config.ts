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
  entry: path.resolve(
    __dirname,
    "frontend/src/metabase/embedding/embedding-iframe-sdk/embed.ts"
  ),
  output: {
    // We must use a different directory than the main Webpack config,
    // otherwise the path conflicts and the output bundle will not appear.
    path: path.resolve(process.cwd(), "dist/metabase"),
    filename: "embed.js",

    library: {
      name: ["metabase", "embed"],
      type: "umd",
    },
    globalObject: "this",
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
              parser: {
                syntax: "typescript",
              },
            },
            sourceMaps: false,
            minify: false,
            env: {
              targets: ["defaults"],
            },
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
        "frontend/src/embedding-sdk-bundle"
      ),
      "embedding-sdk-shared": path.resolve(
        __dirname,
        "frontend/src/embedding-sdk-shared"
      ),
      metabase: path.resolve(__dirname, "frontend/src/metabase"),
      "metabase-types": path.resolve(
        __dirname,
        "frontend/src/metabase-types"
      ),
      "sdk-iframe-embedding-script-ee-plugins": path.resolve(
        __dirname,
        "frontend/src/metabase/plugins/noop"
      ),
    },
  },
};

export default config;
