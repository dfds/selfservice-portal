import express from "express";
import { convertMembershipApplication } from "../converters";
import { state } from "../data";
import { log } from "../helpers";

const router = express.Router();

router.get("/membershipapplications/:id", (req, res) => {
  const found = state.membershipApplications.find(
    (x) => x.id === req.params.id,
  );
  if (found) {
    res.send(convertMembershipApplication(found));
  } else {
    res.sendStatus(404);
  }
});

router.post("/membershipapplications/:id/approvals", (req, res) => {
  const found = state.membershipApplications.find(
    (x) => x.id === req.params.id,
  );
  if (found) {
    const approval = {
      id: "" + new Date().getTime(),
      approvedBy: "me@me.me",
      approvedAt: "2000-01-01",
    };

    found.approvals.push(approval);
    found.__canApprove = false;

    log("added membership application approval: ", approval);
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});

export default router;
