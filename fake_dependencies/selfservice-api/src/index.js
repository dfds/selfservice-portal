import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 3001;

const kafkaClusters = [
  {
    id: "kc-1",
    name: "Development",
    description: "This cluster is for non-production workloads and used in various staging environments. Please note, you should not consume messages in this cluster from your production workloads!",
  },
  {
    id: "kc-2",
    name: "Production",
    description: "This is the production cluster used for production workloads. This cluster has the highes resource allocations and is used for business critical messages.",
  }
];

const capabilities = [
    { 
      id: "this-is-a-capability-xyz", 
      name: "this is a capability", 
      description: "lksd lskd flskdnf lskerntolweirhtn lis dflk slkdmf",
      members: [
        { 
          email: "jandr@dfds.com"
        },
        { 
          email: "thfis@dfds.com"
        },
      ],
      topics: [
        {
          id: "1",
          name: "this-is-a-capability-xyz.foo",
          description: "this is a foo topic for foo stuff",
          kafkaClusterId: "kc-2",
          partitions: 3,
          retention: 1,
          status: "Provisioned"
        },
        {
          id: "2",
          name: "pub.this-is-a-capability-xyz.bar",
          description: "a public topic for bar stuff",
          kafkaClusterId: "kc-2",
          partitions: 3,
          retention: 1,
          status: "Provisioned"
        },
        {
          id: "3",
          name: "this-is-a-capability-xyz.a-foo",
          description: "a topic for a-foo stuff",
          kafkaClusterId: "kc-2",
          partitions: 3,
          retention: 1,
          status: "Provisioned"
        },
        {
          id: "4",
          name: "this-is-a-capability-xyz.b-foo",
          description: "a topic for b-foo stuff",
          kafkaClusterId: "kc-2",
          partitions: 3,
          retention: 1,
          status: "In Progress"
        }
      ]
    },
    { 
      id: "another-awssome-capability-abcd", 
      name: "another awssome capability", 
      description: "lknm lk23lnk nl kl23lk lk",
      members: [
        { 
          email: "thfis@dfds.com" 
        },
      ],
      topics: [
        {
          id: "3",
          name: "another-awssome-capability-abcd.name-of-topic",
          description: "just a dummy topic",
          kafkaClusterId: "kc-2",
          partitions: 3,
          retention: 1,
          status: "Provisioned"
        }
      ]
    },
];

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
  let found = capabilities.find(x => x.id == req.params.id);
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
