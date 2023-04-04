export function composeUrl(...args: string[]) : string {
    let url = process.env.API_BASE_URL ?? "";

    (args || []).forEach(x => {
        if (x[0] == '/') {
            url += x;
        } else {
            url += '/' + x;
        }
    });

    return url;
}

export function log(message: string) : void {
    const timestamp = new Date();
    const time = timestamp.toLocaleTimeString();
    console.log(`${time}> ${message}`);
}

export function fakeDelay() : number {
    let fakeDelay = Math.random() * 1000;
    if (fakeDelay < 200) {
      fakeDelay = 200;
    } else {
      fakeDelay = fakeDelay;
    }
  
    return fakeDelay;
}

export function idPostfix() : string{
    return Math.random().toString(36).replace(/[0-9]/g, '').substring(2, 7);
    //TODO: use hashstring just like the real thing (?)
}

export function getDate(offset: number = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    return date;
}