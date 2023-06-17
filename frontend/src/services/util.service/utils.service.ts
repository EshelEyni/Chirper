import { JsendResponse } from "../../../../shared/interfaces/system.interface";
type AnyFunction = (...args: any[]) => any;

function formatTime(currDate: Date): string {
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

function formatCount(count: number): string {
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

function debounce(func: AnyFunction, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
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

export const utilService = {
  formatTime,
  formatCount,
  makeId,
  debounce,
  getTimeZone,
  getDaysInMonth,
  handleServerResponse,
  copyToClipboard,
};
