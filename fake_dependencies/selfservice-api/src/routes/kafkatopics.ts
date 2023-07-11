import express from "express";
import { convertKafkaTopic, convertMessageContract } from "../converters";
import { MessageContract, state } from "../data";
import { composeUrl, log } from "../helpers";

const router = express.Router();

router.get("/kafkatopics", (req, res) => {
  const capabilityId: string | undefined = req?.query?.capabilityId?.toString();
  const clusterId: string | undefined = req?.query?.clusterId?.toString();
  const includePrivate: boolean =
    (req?.query?.includePrivate?.toString() || "").toLowerCase() === "true";

  let result = state.kafkaTopics;
  if (capabilityId !== undefined) {
    result = result.filter((x) => x.capabilityId === capabilityId);
  }
  if (clusterId !== undefined) {
    result = result.filter((x) => x.kafkaClusterId === clusterId);
  }
  if (!includePrivate) {
    result = result.filter((x) => x.name.startsWith("pub."));
  }

  res.send({
    items: result.map(x => convertKafkaTopic(x)),
    "_embedded": {
      kafkaClusters: {
          items: (state.kafkaClusters || []),
          "_links": {
              self: {
                  href: composeUrl(`/kafkaclusters`),
                  rel: "related",
                  allow: ["GET"]
              }
          }
      }  
  },
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
  const kafkaTopicId : string = req?.params?.id || "";
  const foundTopic = state.kafkaTopics.find(x => x.id == kafkaTopicId);
  if (!foundTopic) {
    res.sendStatus(404);
    return;
  }

  const newContract : MessageContract = {...req.body, ...{
    id: "" + new Date().getTime(),
    status: "In Progress",
    kafkaTopicId: kafkaTopicId,
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

router.put("/kafkatopics/:id/description", (req, res) => {
  const kafkaTopicId : string = req?.params?.id || "";
  const foundTopic = state.kafkaTopics.find(x => x.id == kafkaTopicId);
  if (!foundTopic) {
    res.sendStatus(404);
    return;
  }

  foundTopic.description = req.body.description;

  log(`Changed description on topic ${foundTopic.name} to "${foundTopic.description}"`);

  res.sendStatus(204);
});

export default router;