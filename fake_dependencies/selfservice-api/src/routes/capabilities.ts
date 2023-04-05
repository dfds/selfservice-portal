import express, { Request, Response } from "express";
import { convertCapability, convertMember, convertKafkaTopic, convertKafkaCluster, convertMembershipApplication } from "../converters";
import { state, Capability, KafkaTopic, MembershipApplication } from "../data";
import { composeUrl, createId, getDate, log } from "../helpers";

const router = express.Router();

router.get("/capabilities", (req, res) => {
    res.send({
        items: state.capabilities.map(x => convertCapability(x)),
        "_links": {
          self: {
            href: composeUrl("capabilities"),
            rel: "self",
            allow: ["GET"]
          }
        }
    });
});

router.get("/capabilities/:id", (req, res) => {
    let found = state.capabilities.find(x => x.id == req.params.id);
    if (found) {
        res.send(convertCapability(found));
    } else {
        res.sendStatus(404);
    }
});
 
router.post("/capabilities", (req, res) => {
    const capabilityName : string = req?.body?.name || "";

    const isValidInput = capabilityName.includes("!");
    console.log("validinput: ", isValidInput);

    if (!isValidInput){
      res
        .status(400)
        .send({
            message: "Placeholder for backend error message!"
        });

      return;
    }

    let found : Capability | undefined = state.capabilities.find(x => x.name == capabilityName);
    if (found){
      res
        .status(409)
        .send({
            message: 'capability with that name already exists'
        });

      return;
    }

    const newCapability : Capability = {
      id: capabilityName
        .toLowerCase()
        .replace(" ", "-"),
      name: capabilityName,
      description: req?.body?.description,
      members: [],
      __isMember: true,
      __canJoin: false
    };

    state.capabilities.push(newCapability);

    const dto = convertCapability(newCapability);
    res
        .set("Location", dto._links.self.href)
        .status(201)
        .send(dto);
});

router.get("/capabilities/:id/members", (req, res) => {
    let found = state.capabilities.find(x => x.id == req.params.id);
    if (found) {
        res.send({
            items: (found.members || []).map(x => convertMember(x)),
            "_links": {
              self: {
                href: composeUrl("capabilities", req.params.id),
                rel: "self",
                allow: ["GET"]
              }
            }
        });
    } else {
        res.sendStatus(404);
    }
});


router.get("/capabilities/:id/topics", (req, res) => {
    const foundTopics = state.kafkaTopics.filter(x => x.capabilityId == req.params.id);
    res.send({
        items: (foundTopics || []).map(x => convertKafkaTopic(x)),
        "_embedded": {
            kafkaClusters: {
                items: (state.kafkaClusters || []).map(x => convertKafkaCluster(x)),
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
                href: composeUrl(req.path),
                rel: "self",
                allow: ["GET", "POST"]
            }
        }
    });
});

router.post("/capabilities/:id/topics", (req, res) => {
    const capabilityId : string = req?.params?.id || "";

    const foundCapability  : Capability | undefined = state.capabilities.find(x => x.id == capabilityId);
    if (!foundCapability) {
        res.sendStatus(404);
        return;
    }

    const newTopic : KafkaTopic = {...req.body, ...{
      id: "" + new Date().getTime(),
      status: "In Progress",
    }};

    state.kafkaTopics.push(newTopic);
    log("Added new topic: " + JSON.stringify(newTopic, null, 2));

    const dto = convertKafkaTopic(newTopic);
    res
      .set("Location", dto._links.self.href)
      .status(201)
      .send(dto);

    setTimeout(() => {
      newTopic.status = "Provisioned";
      log(`Changed status on topic ${newTopic.id} to ${newTopic.status}`);
    }, (Math.random() * 2000)+2000);
});

router.get("/capabilities/:id/membershipapplications", (req, res) => {
  const capabilityId : string = req.params.id;

  const applications = state.membershipApplications.filter(x => x.capabilityId === capabilityId);
  res.send({
    items: (applications || []).map(x => convertMembershipApplication(x)),
    _links: {
      self: {
        href: composeUrl(req.path),
        rel: "self",
        allow: ["GET"]
      }
    }
  });
});


router.post("/capabilities/:id/membershipapplications", (req, res) => {
    let found : Capability | undefined = state.capabilities.find(x => x.id == req.params.id);
    if (found) {

      const newApplication : MembershipApplication = {
        id: createId(),
        applicant: "me@me.me",
        approvals: [],
        capabilityId: found.id,
        status: "Pending",
        submittedAt: getDate().toISOString(),
        expiresOn: getDate(12).toISOString(),
        __canApprove: false
      };

      state.membershipApplications.push(newApplication);
      found.__canJoin = false;

      log("new membership application added: ", newApplication);

      res
        .status(201)
        .send(convertMembershipApplication(newApplication));
    } else {
      res
        .status(404)
        .send(`capability not found for id: ${req.params.id}`);
    }
});

export default router;