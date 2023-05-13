import rateLimit from "express-rate-limit";

const getRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: "Too many GET requests, please try again later",
});

const postRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many POST requests, please try again later",
});

const patchRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many PATCH requests, please try again later",
});

const deleteRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many DELETE requests, please try again later",
});

const authRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many authentication requests, please try again later",
});

export {
  getRequestLimiter,
  postRequestLimiter,
  patchRequestLimiter,
  deleteRequestLimiter,
  authRequestLimiter,
};
