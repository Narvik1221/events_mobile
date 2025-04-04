// jest.config.js
module.exports = {
  preset: "jest-expo",
  transform: {
    "^.+\\.tsx?$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  moduleNameMapper: {
    "\\.svg$": "<rootDir>/__mocks__/svgrMock.js",
  },
};
