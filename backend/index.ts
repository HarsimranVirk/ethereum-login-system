import express from 'express';
import Web3 from 'web3';
import cors from 'cors';
import bodyParser from 'body-parser';
const { abi } = require('../../solidity/build/contracts/Login.json');
const TruffleContract = require('@truffle/contract');

const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const loginContract = new web3.eth.Contract(abi, process.env.SMART_CONTRACT_ADDRESS || '0x7C0dc4f3d121ED11A77f03bF2a2F3A23D9cAE4d8');

loginContract.events.LoginAttempt({}, (err: any, ev: any) => {
  if (err) console.log(err);
  console.log(ev);
}).on('data', (ev: any) => {
  console.log(ev);
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/login', (req, res) => {
  loginContract.methods.login('challenge string').send({from: req.body.address});
  res.json({"msg": "called smart TruffleContract"})
})

app.listen(3000, () => {
  console.log('Started listening on PORT 3000');
})

