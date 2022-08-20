import { expect } from "chai";
import { ethers } from "hardhat";
import { HelloWorld } from "../typechain-types";

describe("HelloWorld", function () {
  let contract: any;
  let helloWorld: HelloWorld;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("HelloWorld");
    helloWorld = await contract.deploy();
  });

  describe("Deployment", function () {
    it("Should return hello world", async function () {
      const response = await helloWorld.sayHelloWorld();
      expect(response).to.equal("Hello World from Smart Contract");
    });
  });
});
