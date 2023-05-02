module.exports = [
  {
    client: {
      includes: ["./**/*.tsx"],
      service: {
        name: "Server",
        url: "http://localhost:4000/",
        skipSSLValidation: true,
      },
    },
  },
]
