require("dotenv-flow").config();

const path = require("path");
const Dotenv = require("dotenv-webpack");
const withImages = require("next-images");
const webpack = require("webpack");
const withBundleAnalyzer = require("@zeit/next-bundle-analyzer");
// const isProd = process.env.NODE_ENV === "production";

module.exports = withBundleAnalyzer(
  withImages({
    target: "serverless",
    // You may only need to add assetPrefix in production.
    // assetPrefix: isProd ? process.env.ASSETS_BUCKET_URI : "",
    env: {
      ASSETS_BUCKET_URI: process.env.ASSETS_BUCKET_URI
    },
    webpack: config => {
      config.plugins = config.plugins || [];
      config.plugins = [
        ...config.plugins,
        // Prevent error "Can't resolve encoding" from node-fetch module
        new webpack.IgnorePlugin(/^encoding$/, /node-fetch/, /sitemap/, /zlib/),
        // Read the .env file
        new Dotenv({
          path: process.env.production
            ? path.join(__dirname, ".env.production")
            : path.join(__dirname, ".env.development"),
          systemvars: true
        })
      ];

      return config;
    },
    analyzeServer: ["server", "both"].includes(process.env.BUNDLE_ANALYZE),
    analyzeBrowser: ["browser", "both"].includes(process.env.BUNDLE_ANALYZE),
    bundleAnalyzerConfig: {
      server: {
        analyzerMode: "static",
        reportFilename: "./bundles/server.html"
      },
      browser: {
        analyzerMode: "static",
        reportFilename: "./bundles/client.html"
      }
    }
  })
);
