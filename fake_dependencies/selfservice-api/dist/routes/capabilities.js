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
router.get("/capabilities", (req, res) => {
    res.send({
        items: data_1.state.capabilities.map(x => (0, converters_1.convertCapability)(x))
    });
});
router.get("/capabilities/:id", (req, res) => {
    let found = data_1.state.capabilities.find(x => x.id == req.params.id);
    if (found) {
        res.send((0, converters_1.convertCapability)(found));
    }
    else {
        res.sendStatus(404);
    }
});
router.post("/capabilities", (req, res) => {
    var _a, _b;
    const capabilityName = ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.name) || "";
    const isValidInput = capabilityName.includes("!");
    console.log("validinput: ", isValidInput);
    if (!isValidInput) {
        res
            .status(400)
            .send({
            message: "Placeholder for backend error message!"
        });
        return;
    }
    let found = data_1.state.capabilities.find(x => x.name == capabilityName);
    if (found) {
        res
            .status(409)
            .send({
            message: 'capability with that name already exists'
        });
        return;
    }
    const newCapability = {
        id: capabilityName
            .toLowerCase()
            .replace(" ", "-"),
        name: capabilityName,
        description: (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.description,
        members: [],
        membershipApplications: []
    };
    data_1.state.capabilities.push(newCapability);
    const dto = (0, converters_1.convertCapability)(newCapability);
    res
        .set("Location", dto._links.self.href)
        .status(201)
        .send(dto);
});
router.get("/capabilities/:id/members", (req, res) => {
    let found = data_1.state.capabilities.find(x => x.id == req.params.id);
    if (found) {
        res.send({
            items: (found.members || []).map(x => (0, converters_1.convertMember)(x))
        });
    }
    else {
        res.sendStatus(404);
    }
});
router.get("/capabilities/:id/topics", (req, res) => {
    const foundTopics = data_1.state.kafkaTopics.filter(x => x.capabilityId == req.params.id);
    res.send({
        items: (foundTopics || []).map(x => (0, converters_1.convertKafkaTopic)(x)),
        "_embedded": {
            kafkaClusters: {
                items: (data_1.state.kafkaClusters || []),
                "_links": {
                    self: {
                        href: (0, helpers_1.composeUrl)(`/kafkaclusters`),
                        rel: "related",
                        allow: ["GET"]
                    }
                }
            }
        },
        "_links": {
            self: {
                href: (0, helpers_1.composeUrl)(req.path),
                rel: "self",
                allow: ["GET", "POST"]
            }
        }
    });
});
router.post("/capabilities/:id/topics", (req, res) => {
    var _a;
    const capabilityId = ((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id) || "";
    const foundCapability = data_1.state.capabilities.find(x => x.id == capabilityId);
    if (!foundCapability) {
        res.sendStatus(404);
        return;
    }
    const newTopic = Object.assign(Object.assign({}, req.body), {
        id: "" + new Date().getTime(),
        status: "In Progress",
    });
    data_1.state.kafkaTopics.push(newTopic);
    (0, helpers_1.log)("Added new topic: " + JSON.stringify(newTopic, null, 2));
    const dto = (0, converters_1.convertKafkaTopic)(newTopic);
    res
        .set("Location", dto._links.self.href)
        .status(201)
        .send(dto);
    setTimeout(() => {
        newTopic.status = "Provisioned";
        (0, helpers_1.log)(`Changed status on topic ${newTopic.id} to ${newTopic.status}`);
    }, (Math.random() * 2000) + 2000);
});
router.get("/capabilities/:id/membershipapplications", (req, res) => {
    let found = data_1.state.capabilities.find(x => x.id == req.params.id);
    if (found) {
        res.send({
            membershipApplications: (found.membershipApplications || []),
        });
    }
    else {
        res.status(404).send(`capability not found for id: ${req.params.id}`);
    }
});
router.post("/capabilities/:id/membershipapplications", (req, res) => {
    let found = data_1.state.capabilities.find(x => x.id == req.params.id);
    if (found) {
        res
            .status(501)
            .send("not yet implemented");
        // TODO [pausegh] : implement adding membership application
    }
    else {
        res
            .status(404)
            .send(`capability not found for id: ${req.params.id}`);
    }
});
exports.default = router;
