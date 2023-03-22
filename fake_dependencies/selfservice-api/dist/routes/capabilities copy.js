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
        items: data_1.capabilities.map(x => (0, converters_1.convertCapability)(x))
    });
});
router.get("/capabilities/:id", (req, res) => {
    let found = data_1.capabilities.find(x => x.id == req.params.id);
    if (found) {
        res.send((0, converters_1.convertCapability)(found));
    }
    else {
        res.sendStatus(404);
    }
});
router.get("/capabilities/:id/members", (req, res) => {
    let found = data_1.capabilities.find(x => x.id == req.params.id);
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
    let found = data_1.capabilities.find(x => x.id == req.params.id);
    if (found) {
        res.send({
            items: (found.topics || []).map(x => (0, converters_1.convertKafkaTopic)(x)),
            "_embedded": {
                kafkaClusters: {
                    items: (data_1.kafkaClusters || []),
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
    }
    else {
        res.sendStatus(404);
    }
});
router.get("/capabilities/:id/membershipapplications", (req, res) => {
    let found = data_1.capabilities.find(x => x.id == req.params.id);
    if (found) {
        res.send({
            membershipApplications: (found.membershipApplications || []),
        });
    }
    else {
        res.status(404).send(`capability not found for id: ${req.params.id}`);
    }
});
exports.default = router;
