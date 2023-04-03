import express from "express";
import { convertCapability } from "../converters";
import { state } from "../data";

const router = express.Router();

router.get("/me", (req, res) => {
    res.send({
        capabilities: state.capabilities
            .slice(0, 1)
            .map(x => convertCapability(x)),
        stats: state.stats
    });
});

export default router;