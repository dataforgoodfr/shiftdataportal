require("dotenv-flow").config();

const path = require("path");
const withImages = require("next-images");
const webpack = require("webpack");
// const isProd = process.env.NODE_ENV === "production";

module.exports = withImages({
  webpack: (
      config,
      { isServer }
  ) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
        }
      };
    }
    // Important: return the modified config
    return config
  },
})


