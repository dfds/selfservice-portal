import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const port = process.env.PORT || 3001;

const capabilities = [
    { id: "1", capabilityRootId: "this-is-a-capability", name: "this is a capability", description: "lksd lskd flskdnf lskerntolweirhtn lis dflk slkdmf"},
    { id: "2", capabilityRootId: "another-awssome-capability", name: "another awssome capability", description: "lknm lk23lnk nl kl23lk lk"},
];

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
  console.log(`  --> response status: ${res.statusCode}`);
})

app.get("/ping", (req, res) => {
  res.send("pong!");
});

app.get("/api/capabilities", (req, res) => {
    res.send(capabilities);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});