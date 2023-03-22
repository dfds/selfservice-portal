"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const converters_1 = require("../converters");
const data_1 = require("../data");
const router = express_1.default.Router();
router.get("/me", (req, res) => {
    res.send({
        capabilities: data_1.state.capabilities
            .slice(0, 1)
            .map(x => (0, converters_1.convertCapability)(x))
    });
});
exports.default = router;
