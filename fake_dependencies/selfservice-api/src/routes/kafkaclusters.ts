import express from "express";
import { convertKafkaCluster } from "../converters";
import { state } from "../data";

const router = express.Router();

router.get("/kafkaclusters", (req, res) => {
    res.send({
      items: (state.kafkaClusters || []).map(x => convertKafkaCluster(x))
    });
});

export default router;