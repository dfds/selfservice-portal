export function composeUrl(...args: string[]): string {
  let url = process.env.API_BASE_URL ?? "";

  (args || []).forEach((x) => {
    if (x[0] == "/") {
      url += x;
    } else {
      url += "/" + x;
    }
  });

  return url;
}

export function log(message: string, ...args: any[]): void {
  const timestamp = new Date();
  const time = timestamp.toLocaleTimeString();
  console.log(`${time}> ${message}`, args);
}

export function fakeDelay(): number {
  let fakeDelay = Math.random() * 1000;
  if (fakeDelay < 200) {
    fakeDelay = 200;
  } else {
    fakeDelay = fakeDelay;
  }

  return fakeDelay;
}

export function idPostfix(): string {
  return Math.random().toString(36).replace(/[0-9]/g, "").substring(2, 7);
  //TODO: use hashstring just like the real thing (?)
}

export function getDate(offset: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  return date;
}

let nextIdSeed: number = 0;

export function createId(): string {
  nextIdSeed = nextIdSeed++;
  return "" + new Date().getTime() + "-" + nextIdSeed;
}
