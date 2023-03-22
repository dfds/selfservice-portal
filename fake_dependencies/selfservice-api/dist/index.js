"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const helpers_1 = require("./helpers");
const capabilities_1 = __importDefault(require("./routes/capabilities"));
const kafkaclusters_1 = __importDefault(require("./routes/kafkaclusters"));
const kafkatopics_1 = __importDefault(require("./routes/kafkatopics"));
const me_1 = __importDefault(require("./routes/me"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
// ----------------------------------------------------------------------------------------------------
app.use((req, res, next) => {
    setTimeout(() => {
        next();
        (0, helpers_1.log)(`${req.method} ${req.originalUrl} --> response status: ${res.statusCode}`);
    }, (0, helpers_1.fakeDelay)());
});
// ----------------------------------------------------------------------------------------------------
app.get("/ping", (req, res) => {
    res.send("pong!");
});
app.use(capabilities_1.default);
app.use(kafkaclusters_1.default);
app.use(kafkatopics_1.default);
app.use(me_1.default);
// ----------------------------------------------------------------------------------------------------
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
