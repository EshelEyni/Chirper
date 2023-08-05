import devConfig from "./dev";
import prodConfig from "./prod";
let config: {
  dbURL?: string;
  jwtSecretCode?: string;
  jwtExpirationTime?: string;
  giphyApiKey?: string;
  googleApiKey?: string;
  emailUsername?: string;
  emailPassword?: string;
  emailHost?: string;
  emailPort?: number;
  note?: string;
};

if (process.env.NODE_ENV === "production") config = prodConfig;
else config = devConfig;

export default config;
