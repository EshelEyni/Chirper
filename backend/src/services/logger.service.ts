const fs = require("fs");
const { asyncLocalStorage } = require("./als.service");
import { User } from "../../../shared/interfaces/user.interface";
const ansiColors = require("ansi-colors");

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

function doLog(level: string, ...args: (string | Error | Record<string, unknown>)[]) {
  const strs = args.map((arg) => (typeof arg === "string" || isError(arg) ? arg : JSON.stringify(arg)));

  let line = strs.join(" | ");
  const store = asyncLocalStorage.getStore();
  const userId = (store as Record<string, User | undefined>)?.loggedinUser?._id;
  const str = userId ? `(userId: ${userId})` : "";
  line = `${getTime()} - ${level} - ${line} ${str}\n`;
  switch (level) {
    case "DEBUG":
      line = ansiColors.bgBlue(line);
      break;
    case "INFO":
      line = ansiColors.bgGreen(line);
      break;
    case "WARN":
      line = ansiColors.bgYellow(line);
      break;
    case "ERROR":
      line = ansiColors.bgRed(line);
      break;
  }
  console.log(line);
  fs.appendFile("./logs/backend.log", line, (err: any) => {
    if (err) console.log(ansiColors.red("FATAL: cannot write to log file"));
  });
}

function debug(...args: string[]) {
  if (process.env.NODE_NEV === "production") return;
  doLog("DEBUG", ...args);
}

function info(...args: any[]) {
  doLog("INFO", ...args);
}

function warn(...args: any[]) {
  doLog("WARN", ...args);
}

function error(...args: Array<string | Error>) {
  doLog("ERROR", ...args);
}

module.exports = {
  logger: {
    debug,
    info,
    warn,
    error,
  },
};