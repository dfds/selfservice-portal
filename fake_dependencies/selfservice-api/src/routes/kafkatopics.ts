import express from "express";
import { convertKafkaTopic, convertMessageContract } from "../converters";
import { state } from "../data";
import { composeUrl, log } from "../helpers";

const router = express.Router();

router.get("/kafkatopics", (req, res) => {
  const result = state.kafkaTopics.filter(x => x.name.startsWith("pub."));
  res.send({
    items: result.map(x => convertKafkaTopic(x)),
    "_links": {
      self: {
        href: composeUrl("kafkatopics"),
        rel: "self",
        allow: ["GET"]
      }
    }
  });
});

router.get("/kafkatopics/:id", (req, res) => {
  const foundTopic = state.kafkaTopics.find(x => x.id == req.params.id);
  if (!foundTopic) {
    res.sendStatus(404);
    return;
  }

  const dto = convertKafkaTopic(foundTopic);
  res.send(dto);
});

router.get("/kafkatopics/:id/messagecontracts", (req, res) => {
  const topicId : string = req?.params?.id || "";

  const foundTopic = state.kafkaTopics.find(x => x.id == topicId);
  if (!foundTopic) {
    res.sendStatus(404);
    return;
  }

  const result = state.messageContracts.filter(x => x.kafkaTopicId == topicId);
  res.send({
    items: result.map(x => convertMessageContract(x)),
    "_links": {
      self: {
        href: req.path,
        rel: "self",
        allow: ["GET"]
      }
    }
  });
});

router.post("/kafkatopics/:id/messagecontracts", (req, res) => {
  const foundTopic = state.kafkaTopics.find(x => x.id == req.params.id);
  if (!foundTopic) {
    res.sendStatus(404);
    return;
  }

  const newContract = {...req.body, ...{
    id: "" + new Date().getTime(),
    status: "In Progress",
  }};

  state.messageContracts.push(newContract);
  log("Added new message contract: " + JSON.stringify(newContract, null, 2));

  const dto = convertMessageContract(newContract);

  res
    .set("Location", dto._links.self.href)
    .status(201)
    .send(newContract);

  setTimeout(() => {
      newContract.status = "Provisioned";
      log(`Changed status on message contract ${newContract.id} to ${newContract.status}`);
  }, (Math.random() * 2000)+2000);

});

export default router;