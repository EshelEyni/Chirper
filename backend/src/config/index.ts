const devConfig = require("./dev");
const prodConfig = require("./prod");
let config: {
  dbURL: any;
  sessionKey: any;
  giphyApiKey: any;
  googleApiKey: any;
  note?: string;
};

if (process.env.NODE_ENV === "production") {
  config = prodConfig;
} else {
  config = devConfig;
}

module.exports = config;
