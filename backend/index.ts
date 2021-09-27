import express, { RequestHandler } from "express";
import Web3 from "web3";
import cors from "cors";
import bodyParser from "body-parser";
import cuid from "cuid";
import jwt from "jsonwebtoken";
const { abi } = require("../../solidity/build/contracts/Login.json");
const TruffleContract = require("@truffle/contract");

const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws://localhost:8545")
);
const loginContract = new web3.eth.Contract(
  abi,
  process.env.SMART_CONTRACT_ADDRESS ||
    "0x7C0dc4f3d121ED11A77f03bF2a2F3A23D9cAE4d8"
);

const challenges: Map<string, string> = new Map();
const successfulLogins: Map<string, boolean> = new Map();

loginContract.events
  .LoginAttempt({}, (err: any, ev: any) => {
    if (err) console.log(err);
    console.log(ev);
  })
  .on("data", (ev: any) => {
    if (ev.returnValues.challenge === challenges.get(ev.returnValues.sender)) {
      successfulLogins.set(ev.returnValues.sender, true);
    }
  });

const app = express();
app.use(bodyParser.json());
app.use("/", express.static("../frontend"));
app.use(cors());

const secret =
  process.env.SECRET || "super-secret-key-bct-lab-assignment-181080031";

const verifyToken: RequestHandler = (req, res, next) => {
  try {
    console.log(req.body);
    req.body.jwt = jwt.verify(req.body.token, secret);
    next();
  } catch (e) {
    res.sendStatus(401);
  }
};

app.post("/login", (req, res) => {
  const challenge = cuid();
  challenges.set(req.body.address, challenge);

  loginContract.methods.login(challenge).send({ from: req.body.address });

  const token = jwt.sign(
    {
      address: req.body.address,
      access: "checking",
    },
    secret
  );

  res.json({ token, challenge });
});

app.post("/getStandardAccess", verifyToken, (req, res) => {
  if (
    !req.body.jwt ||
    !req.body.jwt.address ||
    req.body.jwt.access !== "checking"
  ) {
    res.sendStatus(400);
  }

  if (
    successfulLogins.has(req.body.jwt.address) &&
    successfulLogins.get(req.body.jwt.address)
  ) {
    successfulLogins.delete(req.body.jwt.address);
    challenges.delete(req.body.jwt.address);

    const token = jwt.sign(
      {
        address: req.body.jwt.address,
        access: "standard",
      },
      secret
    );

    res.json({ token });
  } else res.sendStatus(401);
});

app.post("/getBalance", verifyToken, async (req, res) => {
  if (
    !req.body.jwt ||
    !req.body.jwt.address ||
    req.body.jwt.access != "standard"
  ) {
    res.sendStatus(401);
  }
  let balance = await web3.eth.getBalance(req.body.jwt.address);
  balance = web3.utils.fromWei(balance) + " ETH";
  res.json({ balance });
});

app.listen(3000, () => {
  console.log("Started listening on PORT 3000");
});
