"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idPostfix = exports.fakeDelay = exports.log = exports.composeUrl = void 0;
function composeUrl(...args) {
    var _a;
    let url = (_a = process.env.API_BASE_URL) !== null && _a !== void 0 ? _a : "";
    (args || []).forEach(x => {
        if (x[0] == '/') {
            url += x;
        }
        else {
            url += '/' + x;
        }
    });
    return url;
}
exports.composeUrl = composeUrl;
function log(message) {
    const timestamp = new Date();
    const time = timestamp.toLocaleTimeString();
    console.log(`${time}> ${message}`);
}
exports.log = log;
function fakeDelay() {
    let fakeDelay = Math.random() * 1000;
    if (fakeDelay < 200) {
        fakeDelay = 200;
    }
    else {
        fakeDelay = fakeDelay;
    }
    return fakeDelay;
}
exports.fakeDelay = fakeDelay;
function idPostfix() {
    return Math.random().toString(36).replace(/[0-9]/g, '').substring(2, 7);
    //TODO: use hashstring just like the real thing (?)
}
exports.idPostfix = idPostfix;
