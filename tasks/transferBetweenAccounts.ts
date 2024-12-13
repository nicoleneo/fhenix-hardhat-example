import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { Token } from "../typechain-types";
import fs from "fs";

task("task:transferBetweenNamedAccounts")
  .addPositionalParam("from", "name of source account")
  .addPositionalParam("to", "name of destination account")
  .addPositionalParam("amount", "amount to transfer")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { from, to, amount } = taskArguments;
    const { fhenixjs, ethers, deployments } = hre;

    const namedAccounts = await hre.getNamedAccounts();
    if (!(from in namedAccounts)) {
      throw Error(`account name ${from} does not exist`);
    }
    if (!(to in namedAccounts)) {
      throw Error(`account name ${to} does not exist`);
    }
    const fromAddress = namedAccounts[from];
    const toAddress = namedAccounts[to];

    // Get Token contract
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
    const tokenContract = await ethers.getContractAt("Token", address.Token);

    const transferFunction = tokenContract.getFunction(
      "transfer(address,address,uint256)",
    );
    const transferAmount = BigInt(amount);
    console.log(
      `Transferring ${transferAmount} MHT from ${from} (${fromAddress}) to ${to} (${toAddress})`,
    );
    await transferFunction(fromAddress, toAddress, transferAmount);
    console.log(`Done!`);
  });
