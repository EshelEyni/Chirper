const devConfig = require("./dev");
const prodConfig = require("./prod");
let config: {
  dbURL: any;
  sessionKey: any;
  giphyApiKey: any;
  googleApiKey: any;
  note?: string;
};

// keys.ts - figure out what set of credentials to return
if (process.env.NODE_ENV === "production") {
  // we are in production - return the prod set of keys
  config = prodConfig;
} else {
  // we are in development - return the dev keys!!!
  config = devConfig;
}

module.exports = config;
