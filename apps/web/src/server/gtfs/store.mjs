import { loadGtfs } from "./loadGtfs.mjs";

let cached = null;

const dayKey = (date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export function getGtfs(date = new Date()) {
  const key = dayKey(date);

  if (!cached || cached.key !== key) {
    const promise = loadGtfs(date);
    cached = { key, promise };

    promise.catch(() => {
      if (cached?.promise === promise) cached = null;
    });
  }

  return cached.promise;
}
