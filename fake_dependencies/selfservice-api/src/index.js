import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { kafkaClusters, capabilities } from "./dummyData";
const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 3001;

// ----------------------------------------------------------------------------------------------------

function composeUrl(...args) {
  let url = process.env.API_BASE_URL;
  (args || []).forEach(x => {
      if (x[0] == '/') {
          url += x;
      } else {
          url += '/' + x;
      }
  });
  return url;
}

function simplifyCapability(capability) {
  return {
    id: capability.id,
    name: capability.name,
    description: capability.description,
    "_links": {
      self: {
        href: composeUrl(`/capabilities/${capability.id}`),
        rel: "self",
        allow: ["GET"]
      },
      members: {
        href: composeUrl(`/capabilities/${capability.id}/members`),
        rel: "related",
        allow: ["GET"]
      },
      topics: {
        href: composeUrl(`/capabilities/${capability.id}/topics`),
        rel: "related",
        allow: ["GET"]
      }
    }
  };
}

function log(message) {
  const timestamp = new Date();
  const time = timestamp.toLocaleTimeString();
  console.log(`${time}> ${message}`);
}

function fakeDelay() {
  let fakeDelay = Math.random() * 1000;
  if (fakeDelay < 200) {
    fakeDelay = 200;
  } else {
    fakeDelay = fakeDelay;
  }

  return fakeDelay;
}

function idPostfix(){
  return Math.random().toString(36).replace(/[0-9]/g, '').substring(2, 7);
  //TODO: use hashstring just like the real thing (?)
}

// ----------------------------------------------------------------------------------------------------

app.use((req, res, next) => {
  setTimeout(() => {
    next();
    log(`${req.method} ${req.originalUrl} --> response status: ${res.statusCode}`);
  }, fakeDelay());

});

// ----------------------------------------------------------------------------------------------------

app.get("/ping", (req, res) => {
  res.send("pong!");
});

// ----------------------------------------------------------------------------------------------------

app.get("/capabilities", (req, res) => {
  res.send({
    items: capabilities.map(x => simplifyCapability(x))
  });
});

app.get("/capabilities/:id", (req, res) => {
  let found = capabilities.find(x => x.name == req.params.id);
  if (found) {
    res.send(simplifyCapability(found));
  } else {
    res.sendStatus(404);
  }
});

app.get("/capabilities/:id/topics", (req, res) => {
  let found = capabilities.find(x => x.id == req.params.id);
  if (found) {
    res.send({
      items: (found.topics || []),
      "_embedded": {
        kafkaClusters: {
          items: (kafkaClusters || []),
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
          allow: ["GET"]
        }
      }
    });
  } else {
    res.sendStatus(404);
  }
});

// ----------------------------------------------------------------------------------------------------

 //TODO: input santitation in backend too

function checkValidInput(input) {

  const isNameValid = input !== "" &&
  !input.match(/^\s*$/g) &&
  !input.match(/(-|_)$/g) &&
  !input.match(/[^a-zA-Z0-9\-_]/g);

  if (input.length > 0){
    if (!isNameValid) {
      return [false, 'Invalid name: Allowed characters are a-z, 0-9, "-", "_" and it may not end with "-" or "_".'];
    }else{
      return [true, ""];
    }
  }
  return [false, 'Capability name may not be empty'];
}

// ----------------------------------------------------------------------------------------------------
app.post("/capabilities", (req, res) => {
  let [isValidInput, errMsg] = checkValidInput(req.body.name);
  console.log("validinput: ", isValidInput);
  if (!isValidInput){
    res.status(400).send({message: errMsg});
    return;
  }
  let found = capabilities.find(x => x.name == req.body.name);
  if (found){
    res.status(409).send({message: 'capability with that name already exists'});
    return;
  }
  //TODO: input sanitation
  const newId = `${req.body.name}-${idPostfix()}`;
  const newCapability = {
    id:newId,
    name: req.body.name,
    description: req.body.description,
    members: [], //TODO: get user email
    topics:  []
  }
  capabilities.push(newCapability);
  res.status(201).send(`/capabilities/${newId}`); //default should be error
});
// ----------------------------------------------------------------------------------------------------

app.post("/capabilities/:id/topics", (req, res) => {
  let found = capabilities.find(x => x.id == req.params.id);
  if (found) {
    const topics = found.topics || [];
    const newTopic = {...req.body, ...{
      id: "" + new Date().getTime(),
      status: "In Progress",
    }};

    topics.push(newTopic);
    found.topics = topics;

    log("Added new topic: " + JSON.stringify(newTopic, null, 2));

    res
      .set("Location", composeUrl(`${req.path}/${newTopic.id}`))
      .status(201)
      .send(newTopic);

    setTimeout(() => {
      newTopic.status = "Provisioned";
      log(`Changed status on topic ${newTopic.id} to ${newTopic.status}`);
    }, (Math.random() * 2000)+2000);

  } else {
    res.sendStatus(404);
  }
});

app.get("/capabilities/:id/members", (req, res) => {
  let found = capabilities.find(x => x.id == req.params.id);
  if (found) {
    res.send({ items: found.members || [] });
  } else {
    res.sendStatus(404);
  }
});

// ----------------------------------------------------------------------------------------------------

app.get("/kafkaclusters", (req, res) => {
  res.send({
    items: kafkaClusters || []
  });
});

// ----------------------------------------------------------------------------------------------------

app.get("/me", (req, res) => {
  res.send({
    capabilities: capabilities
      .slice(0,1)
      .map(x => simplifyCapability(x))
  });
});

// ----------------------------------------------------------------------------------------------------

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

// ----------------------------------------------------------------------------------------------------

app.get("/topics", (req, res) => {
  const result = [];

  capabilities.forEach(capability => {
    const topics = capability.topics || [];
    topics.forEach(topic => {
      const item = {
        capabilityId: capability.id,
        name: topic.name,
        kafkaClusterId: topic.kafkaClusterId,
        description: topic.description,
        partitions: topic.partitions,
        retention: topic.retention,
        status: topic.status
      }
      result.push(item);
    });
  });

  res.send({
    items: result
  });
});




// ----------------------------------------------------------------------------------------------------
