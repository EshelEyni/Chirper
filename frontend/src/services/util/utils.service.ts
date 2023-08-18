import { JsendResponse, UserMsg } from "../../../../shared/interfaces/system.interface";
type AnyFunction = (...args: any[]) => any;

function formatDateToRelativeTime(currDate: Date): string {
  const timestamp = new Date(currDate).getTime();
  const now = Date.now();
  const difference = now - timestamp;
  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.toLocaleString("en", { month: "short" });
  const day = date.getDate();

  if (days > 365) {
    return `${month} ${day}, ${year}`;
  } else if (days > 0) {
    return `${month} ${day}`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    if (seconds == 0) return `now`;
    return `${seconds}s`;
  }
}

function formatDateToCleanString(currDate: Date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const date = new Date(currDate);

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;

  const strTime = hours + ":" + minutesStr + " " + ampm;
  const month = months[date.getMonth()];
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

function makeId(length = 12): string {
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

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function handleServerResponse<T>(response: JsendResponse): T {
  if (response.status === "success") {
    return response.data;
  } else if (response.status === "fail") {
    const errorMessages = Object.entries(response.data)
      .map(([field, message]) => `${field}: ${message}`)
      .join(", ");
    throw new Error(errorMessages);
  } else {
    throw new Error("Unexpected response status");
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file."));
      }
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

export {
  formatDateToRelativeTime,
  formatNumToK,
  makeId,
  debounce,
  getTimeZone,
  getDaysInMonth,
  monthNames,
  handleServerResponse,
  copyToClipboard,
  formatDateToCleanString,
  readAsDataURL,
  getBasePathName,
  getDefaultErrorMsg,
};
