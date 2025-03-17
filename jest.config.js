export default {
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/"
  ]
};