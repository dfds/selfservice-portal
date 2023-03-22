"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const converters_1 = require("../converters");
const data_1 = require("../data");
const helpers_1 = require("../helpers");
const router = express_1.default.Router();
router.get("/kafkatopics", (req, res) => {
    const result = data_1.state.kafkaTopics.filter(x => x.name.startsWith("pub."));
    res.send({
        items: result.map(x => (0, converters_1.convertKafkaTopic)(x)),
        "_links": {
            self: {
                href: (0, helpers_1.composeUrl)("kafkatopics"),
                rel: "self",
                allow: ["GET"]
            }
        }
    });
});
router.get("/kafkatopics/:id", (req, res) => {
    const foundTopic = data_1.state.kafkaTopics.find(x => x.id == req.params.id);
    if (!foundTopic) {
        res.sendStatus(404);
        return;
    }
    const dto = (0, converters_1.convertKafkaTopic)(foundTopic);
    res.send(dto);
});
router.post("/kafkatopics/:id/messagecontracts", (req, res) => {
    const foundTopic = data_1.state.kafkaTopics.find(x => x.id == req.params.id);
    if (!foundTopic) {
        res.sendStatus(404);
        return;
    }
    const newContract = Object.assign(Object.assign({}, req.body), {
        id: "" + new Date().getTime(),
        status: "In Progress",
    });
    data_1.state.messageContracts.push(newContract);
    (0, helpers_1.log)("Added new message contract: " + JSON.stringify(newContract, null, 2));
    const dto = (0, converters_1.convertMessageContract)(newContract);
    res
        .set("Location", dto._links.self.href)
        .status(201)
        .send(newContract);
    setTimeout(() => {
        newContract.status = "Provisioned";
        (0, helpers_1.log)(`Changed status on message contract ${newContract.id} to ${newContract.status}`);
    }, (Math.random() * 2000) + 2000);
});
exports.default = router;
