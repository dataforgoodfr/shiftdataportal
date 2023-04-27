const withImages = require("next-images");
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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
})


