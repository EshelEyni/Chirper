function formatTime(timestamp: number): string {
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

function makeKey(length = 5): string {
  let txt = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return txt;
}

export const utilService = {
  formatTime,
  formatCount,
  makeKey,
};
