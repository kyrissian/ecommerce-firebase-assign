module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "src"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^(.*/)?firebaseConfig$": "<rootDir>/src/__mocks__/firebaseConfig.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          verbatimModuleSyntax: false,
          module: "commonjs",
          types: ["jest", "node"],
        },
      },
    ],
  },
};
