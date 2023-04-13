const { defaults } = require("jest-config");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  reporters: ["default", "jest-junit"]
};
