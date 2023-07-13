import express from "express";
import { convertKafkaCluster } from "../converters";
import { state } from "../data";
import { composeUrl } from "../helpers";

const router = express.Router();


router.get("/kafkaclusters", (req, res) => {
    res.send({
      items: (state.kafkaClusters || []).map(x => convertKafkaCluster(x)),
      "_links": {
        self: {
          href: composeUrl("kafkaclusters"),
          rel: "self",
          allow: ["GET"]
        }
      }
    });
});

export default router;