module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "src"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup-after-env.ts"],
  moduleNameMapper: {
    "^(.*/)?firebaseConfig$": "<rootDir>/src/__mocks__/firebaseConfig.ts",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
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
          types: ["jest", "node", "vite/client"],
        },
      },
    ],
  },
};
