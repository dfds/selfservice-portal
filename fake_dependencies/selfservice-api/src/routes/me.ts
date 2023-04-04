import express from "express";
import { convertCapability } from "../converters";
import { state } from "../data";
import { isMemberOf } from "../helpers";

const router = express.Router();

router.get("/me", (req, res) => {
    res.send({
        capabilities: state.capabilities
            .filter(x => isMemberOf(x))
            .map(x => convertCapability(x)),
        stats: state.stats
    });
});

export default router;