import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const port = process.env.PORT || 3001;

const kafkaClusters = [
  {
    id: "kc-1",
    name: "Development"
  },
  {
    id: "kc-2",
    name: "Production"
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
          name: "cloudengineering.selfservice.foo",
          description: "this is a foo topic for foo stuff",
          kafkaClusterId: "kc-2",
          partitions: 3,
          retention: 1,
          status: "Provisioned"
        },
        {
          id: "2",
          name: "pub.cloudengineering.selfservice.bar",
          description: "a public topic for bar stuff",
          kafkaClusterId: "kc-2",
          partitions: 3,
          retention: 1,
          status: "Provisioned"
        },
        {
          id: "3",
          name: "cloudengineering.selfservice.a-foo",
          description: "a topic for a-foo stuff",
          kafkaClusterId: "kc-2",
          partitions: 3,
          retention: 1,
          status: "Provisioned"
        },
        {
          id: "4",
          name: "cloudengineering.selfservice.b-foo",
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
          name: "capability.name-of-topic",
          description: "just a dummy topic",
          kafkaClusterId: "kc-2",
          partitions: 3,
          retention: 1,
          status: "Provisioned"
        }
      ]
    },
];

function simplifyCapability(capability) {
  return {
    id: capability.id,
    name: capability.name,
    description: capability.description,
    "_links": {
      self: {
        href: `/api/capabilities/${capability.id}`,
        rel: "self",
        allow: ["GET"]
      },
      members: {
        href: `/api/capabilities/${capability.id}/members`,
        rel: "related",
        allow: ["GET"]
      },
      topics: {
        href: `/api/capabilities/${capability.id}/topics`,
        rel: "related",
        allow: ["GET"]
      }
    }
  };
}

app.use((req, res, next) => {
  let fakeDelay = Math.random() * 1000;
  if (fakeDelay < 200) {
    fakeDelay = 200;
  } else {
    fakeDelay = fakeDelay;
  }

  console.log(`${req.method} ${req.originalUrl}`);

  setTimeout(() => {
    next();
  }, fakeDelay);
  
  console.log(`  --> response status: ${res.statusCode}`);
});

app.get("/ping", (req, res) => {
  res.send("pong!");
});

// ----------------------------------------------------------------------------------------------------

app.get("/api/capabilities", (req, res) => {

  res.send({ 
    items: capabilities.map(x => simplifyCapability(x))
  });
});

app.get("/api/capabilities/:id", (req, res) => {
  let found = capabilities.find(x => x.id == req.params.id);
  if (found) {
    res.send(simplifyCapability(found));
  } else {
    res.sendStatus(404);
  }
});

app.get("/api/capabilities/:id/topics", (req, res) => {
  let found = capabilities.find(x => x.id == req.params.id);
  if (found) {
    res.send({ 
      items: (found.topics || []),
      "_embedded": {
        kafkaClusters: {
          items: (kafkaClusters || []),
          "_links": {
            self: {
              href: `/api/kafkaclusters`,
              rel: "related",
              allow: ["GET"]
            }
          }
        }
      },
      "_links": {
        self: {
          href: req.path,
          rel: "self",
          allow: ["GET"]
        }
      }
    });
  } else {
    res.sendStatus(404);
  }
});

app.get("/api/capabilities/:id/members", (req, res) => {
  let found = capabilities.find(x => x.id == req.params.id);
  if (found) {
    res.send({ items: found.members || [] });
  } else {
    res.sendStatus(404);
  }
});

// ----------------------------------------------------------------------------------------------------

app.get("/api/kafkaclusters", (req, res) => {
  res.send({ 
    items: kafkaClusters || []
  });
});

// ----------------------------------------------------------------------------------------------------

app.get("/api/me", (req, res) => {
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
