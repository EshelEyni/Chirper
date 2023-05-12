const devConfig = require("./dev");
const prodConfig = require("./prod");
let config: {
  dbURL: string;
  jwtSecretCode: string;
  jwtExpirationTime: string;
  giphyApiKey: string;
  googleApiKey: string;
  note?: string;
};

if (process.env.NODE_ENV === "production") {
  config = prodConfig;
} else {
  config = devConfig;
}

module.exports = config;
