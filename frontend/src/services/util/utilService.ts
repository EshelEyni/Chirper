import { AnyFunction, JsendResponse, UserMsg } from "../../../../shared/types/system";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;
const MINUTE_IN_MS = 60 * 1000;

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_YEAR = 365;
const TWELVE_HOURS = 12;
const TEN_MINUTES = 10;

const months = [
  { full: "January", short: "Jan" },
  { full: "February", short: "Feb" },
  { full: "March", short: "Mar" },
  { full: "April", short: "Apr" },
  { full: "May", short: "May" },
  { full: "June", short: "Jun" },
  { full: "July", short: "Jul" },
  { full: "August", short: "Aug" },
  { full: "September", short: "Sep" },
  { full: "October", short: "Oct" },
  { full: "November", short: "Nov" },
  { full: "December", short: "Dec" },
];

function isValidDate(dateStr: string) {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

function formatDateToRelativeTime(dateStr: string): string {
  if (!dateStr || !isValidDate(dateStr)) return "";
  const [seconds, minutes, hours, days] = _calculateTimeDifference(dateStr);

  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.toLocaleString("en", { month: "short" });
  const day = date.getDate();

  if (days > DAYS_IN_YEAR) return `${month} ${day}, ${year}`;
  if (days > 0) return `${month} ${day}`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return seconds === 0 ? "now" : `${seconds}s`;
}

function _calculateTimeDifference(dateStr: string): [number, number, number, number] {
  const timestamp = new Date(dateStr).getTime();
  const now = Date.now();
  const difference = now - timestamp;
  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  const days = Math.floor(hours / HOURS_IN_DAY);
  return [seconds, minutes, hours, days];
}

function formatDateToCleanString(dateStr: string): string {
  if (!dateStr || !isValidDate(dateStr)) return "";
  const date = new Date(dateStr);
  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= TWELVE_HOURS ? "PM" : "AM";
  hours = hours % TWELVE_HOURS || TWELVE_HOURS;
  const minutesStr = minutes < TEN_MINUTES ? `0${minutes}` : minutes;

  const strTime = `${hours}:${minutesStr} ${ampm}`;
  const month = months[date.getMonth()].short;
  const day = date.getDate();
  const year = date.getFullYear();

  return `${strTime} · ${month} ${day}, ${year}`;
}

function formatNumToK(count: number): string {
  if (count >= 10000) {
    const formattedCount = (count / 1000).toFixed(1);
    return `${formattedCount}k`;
  } else {
    return count.toLocaleString();
  }
}

function createId(length = 12): string {
  let txt = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return txt;
}

function debounce(
  func: AnyFunction,
  delay: number
): { debouncedFunc: AnyFunction; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debouncedFunc = function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
  const cancel = () => {
    clearTimeout(timeoutId);
  };
  return { debouncedFunc, cancel };
}

function getTimeZone(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "long",
    hour: "numeric",
  })
    .formatToParts()
    .find(part => part.type === "timeZoneName")?.value;

  return timeZoneName ? timeZoneName : "Time Zone Not Found";
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function handleServerResponseData<T>(response: JsendResponse<T>): T {
  if (!response.data) throw new Error("Unexpected response status");

  if (response.status === "success") return response.data;

  if (response.status === "fail") {
    const errorMessages = Object.entries(response.data)
      .map(([field, message]) => `${field}: ${message}`)
      .join(", ");
    throw new Error(errorMessages);
  }

  throw new Error("Unexpected response status");
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read file."));
    };
    reader.readAsDataURL(file);
  });
}

function getBasePathName(path: string, currNestedPath: string): string {
  const pathSegments = path.split("/");
  const currNestedPathSegmentIdx = pathSegments.findIndex(segment => segment === currNestedPath);
  if (currNestedPathSegmentIdx === -1) return "/home";
  const basePath = pathSegments.slice(0, currNestedPathSegmentIdx).join("/");
  return basePath;
}

function getDefaultErrorMsg(): UserMsg {
  return {
    type: "error",
    text: "Something went wrong, but don’t fret — let’s give it another shot.",
  };
}

function getToolTipStyles(options?: React.CSSProperties): React.CSSProperties {
  return {
    fontSize: "12px",
    padding: "5px 10px",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    zIndex: 1500,
    ...options,
  };
}

export {
  formatDateToRelativeTime,
  formatNumToK,
  createId,
  debounce,
  getTimeZone,
  getDaysInMonth,
  months,
  handleServerResponseData,
  copyToClipboard,
  formatDateToCleanString,
  readAsDataURL,
  getBasePathName,
  getDefaultErrorMsg,
  getToolTipStyles,
  DAY_IN_MS,
  HOUR_IN_MS,
  MINUTE_IN_MS,
};
