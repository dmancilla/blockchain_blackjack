import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import session from "express-session";
import {ethers} from "ethers";
import * as fs from "fs";

import {BlackjackGame} from "../../blockchain/typechain-types/contracts/BlackjackGame";

dotenv.config();

const providerUrl = process.env.LOCAL_URL !== '' ? process.env.LOCAL_URL : process.env.TESTNET_URL;

const app: Express = express();
app.use(express.json())

app.use(session({secret: 'keyboard cat'}));

app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, ContractAddress");
    next();
});

app.get("/new", async (req: Request, res: Response) => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const fileContent = fs.readFileSync("../blockchain/artifacts/contracts/BlackjackGame.sol/BlackjackGame.json", {encoding: 'utf-8'})
    const factory = ethers.ContractFactory.fromSolidity(fileContent, wallet);
    const contractCasino = await factory.deploy({value: 5000, gasLimit: 10_000_000}) as BlackjackGame;
    const contractCasinoDeployed = await contractCasino.deployTransaction.wait();
    await contractCasino.iniciar();
    res.json(contractCasinoDeployed.contractAddress);
})

app.listen(process.env.PORT, () => {
    console.log(`[server]: API Server is running at http://localhost:${(process.env.PORT)}`);
});
