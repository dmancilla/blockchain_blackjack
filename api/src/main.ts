import dotenv from "dotenv";
import express, {Express, Request, Response} from "express";

import {getContract} from "./contract";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const contract = getContract();

app.all('/*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get("/", async (req: Request, res: Response) => {
    const response = await contract.sayHelloWorld();
    res.json({
        message: response
    });
});

app.listen(port, () => {
    console.log(
        `⚡️[server]: DApp API Server is running at http://localhost:${port}`
    );
});
