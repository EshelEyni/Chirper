import fs from "fs";
import { asyncLocalStorage } from "./als.service.js";
import { User } from "../models/user.model.js";

const logsDir = "./logs";
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

//define the time format
function getTime(): string {
  const now = new Date();
  return now.toLocaleString("he");
}

function isError(e: any): boolean {
  return e instanceof Error && !!e.stack && !!e.message;
}

function doLog(
  level: string,
  ...args: (string | Error | Record<string, unknown>)[]
) {
  const strs = args.map((arg) =>
    typeof arg === "string" || isError(arg) ? arg : JSON.stringify(arg)
  );

  let line = strs.join(" | ");
  const store = asyncLocalStorage.getStore();
  const userId = (store as Record<string, User | undefined>)?.loggedinUser?._id;
  const str = userId ? `(userId: ${userId})` : "";
  line = `${getTime()} - ${level} - ${line} ${str}\n`;
  console.log(line);
  fs.appendFile("./logs/backend.log", line, (err) => {
    if (err) console.log("FATAL: cannot write to log file");
  });
}

export function debug(...args) {
  if (process.env.NODE_NEV === "production") return;
  doLog("DEBUG", ...args);
}

export function info(...args) {
  doLog("INFO", ...args);
}

export function warn(...args) {
  doLog("WARN", ...args);
}

export function error(...args) {
  doLog("ERROR", ...args);
}
