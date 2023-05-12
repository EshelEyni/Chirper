export default {
  note: "No actual secrets here!",
  dbURL: process.env.MONGO_DB_URL,
  sessionKey: process.env.SESSION_KEY,
  giphyApiKey: process.env.GIPHY_API_KEY,
  googleApiKey: process.env.GOOGLE_API_KEY,
  jwtSecretCode: process.env.JWT_SECRET_CODE,
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME,
  emailUsername: process.env.EMAIL_USERNAME,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailHost: process.env.EMAIL_HOST,
  emailPort: parseInt(process.env.EMAIL_PORT ?? "587", 10),
};
