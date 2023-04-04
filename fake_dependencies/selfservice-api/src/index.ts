import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { log, fakeDelay } from "./helpers";

import capabilityRoutes from "./routes/capabilities";
import kafkaClusterRoutes from "./routes/kafkaclusters";
import kafkaTopicRoutes from "./routes/kafkatopics";
import meRoutes from "./routes/me";
import membershipApplicationsRoutes from "./routes/membershipapplications";

const app = express();

app.use(bodyParser.json());
app.use(cors());

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

app.use(capabilityRoutes);
app.use(kafkaClusterRoutes);
app.use(kafkaTopicRoutes);
app.use(meRoutes);
app.use(membershipApplicationsRoutes);

// ----------------------------------------------------------------------------------------------------

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});


