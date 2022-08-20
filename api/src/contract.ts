import dotenv from "dotenv";
import { ethers } from "ethers";
import { HelloWorld__factory } from "../../blockchain/typechain-types";

dotenv.config();

export const getContract = (environment: "local" | "testnet" = "local") => {
  const url =
    environment === "local" ? process.env.LOCAL_URL : process.env.TESTNET_URL;

  const provider = new ethers.providers.JsonRpcProvider(url);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS!,
    HelloWorld__factory.abi,
    wallet
  );
};
