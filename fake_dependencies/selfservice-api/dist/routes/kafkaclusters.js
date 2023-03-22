"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const converters_1 = require("../converters");
const data_1 = require("../data");
const router = express_1.default.Router();
router.get("/kafkaclusters", (req, res) => {
    res.send({
        items: (data_1.state.kafkaClusters || []).map(x => (0, converters_1.convertKafkaCluster)(x))
    });
});
exports.default = router;
