import { task } from "hardhat/config";
import fs from "fs";
import type { TaskArguments } from "hardhat/types";
import { AddressLike } from "ethers";

// This file is only here to make interacting with the Dapp easier,
// feel free to ignore it if you don't need it.

task("task:faucet", "Sends ETH and tokens to an address")
  .addPositionalParam("receiver", "The address that will receive them")
  .setAction(async (taskArguments: TaskArguments, { ethers, network }) => {
    if (network.name === "hardhat") {
      console.warn(
        "You are running the faucet task with Hardhat network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'",
      );
    }

    const receiver: AddressLike = taskArguments.receiver;

    const addressesFile =
      __dirname + "/../frontend/src/contracts/contract-address.json";

    if (!fs.existsSync(addressesFile)) {
      console.error("You need to deploy your contract first");
      return;
    }

    const addressJson = fs.readFileSync(addressesFile, "utf8");
    const address = JSON.parse(addressJson);

    if ((await ethers.provider.getCode(address.Token)) === "0x") {
      console.error("You need to deploy your contract first");
      return;
    }

    const token = await ethers.getContractAt("Token", address.Token);
    const [sender] = await ethers.getSigners();

    const tx = await token.transfer(receiver, 100);
    await tx.wait();

    const tx2 = await sender.sendTransaction({
      to: receiver,
      value: ethers.WeiPerEther,
    });
    await tx2.wait();

    const tokenBalance = (await token.balanceOf(receiver)).toString();
    const tokenSymbol = await token.symbol();

    console.log(`Transferred 1 ETH and 100 tokens to ${receiver}. Token balance: ${tokenBalance} ${tokenSymbol}`);
  });
