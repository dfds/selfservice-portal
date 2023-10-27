import express from "express";
import { convertCapability } from "../converters";
import { state, isMemberOf } from "../data";

const router = express.Router();

router.get("/me", (req, res) => {
  res.send({
    id: "dummy-user-id@dfds.com",
    personalInformation: {
      email: "dummy-email@dfds.com",
      name: "dummy user name",
    },
    capabilities: state.capabilities
      .filter((x) => isMemberOf(x))
      .map((x) => convertCapability(x)),
    stats: state.stats,
    autoReloadTopics: false,
    _links: {},
  });
});

export default router;
