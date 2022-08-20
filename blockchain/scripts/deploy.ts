import { ethers } from "hardhat";

async function main() {
  console.log("Deploying...");

  const HelloWorld = await ethers.getContractFactory("HelloWorld");
  const contract = await HelloWorld.deploy();
  await contract.deployed();

  console.log("Hello World contract deployed at:", contract);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
