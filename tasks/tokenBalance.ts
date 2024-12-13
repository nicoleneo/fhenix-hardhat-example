import { task, types } from "hardhat/config";
import fs from "fs";

import { ACCOUNT_NAMES } from "../test/constants";
import { TaskArguments } from "hardhat/types";

task("task:listTokenBalance", "Prints the list of accounts and token balances")
.addParam("numaccounts", "Number of accounts to return (1-10)", 3, types.int)
.setAction(async (taskArguments: TaskArguments, hre) => {
  const numAccounts = Number(taskArguments.numaccounts);
  // Validate input
  if (numAccounts < 1 || numAccounts > 10) {
    throw new Error("Number of accounts must be between 1 and 10");
  }

    // Get Token contract
    const ethers = hre.ethers;
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

    // Get signers from hardhat
    const signers = await hre.ethers.getSigners();
    const provider = hre.ethers.provider;
    const accounts = [];
    const { mnemonic } = hre.network.config.accounts;

    // Get details for specified number of accounts
    for (let i = 0; i < numAccounts && i < signers.length; i++) {
      const signer = signers[i];
      const address = await signer.getAddress();
      const phrase = hre.ethers.Mnemonic.fromPhrase(mnemonic);
      const pathDeployer = "m/44'/60'/0'/0/" + i;
      const privateKey = hre.ethers.HDNodeWallet.fromMnemonic(
        phrase,
        pathDeployer,
      ).privateKey;

      const balance = await provider.getBalance(address);
      // getBalance returns wei amount, format to ETH amount
      const balanceEther = hre.ethers.formatEther(balance);
      // get MHT token balance from Token contract
      const tokenBalance = (await token.balanceOf(address)).toString();
      const tokenSymbol = await token.symbol();
      accounts.push({
        index: i,
        privateKey: privateKey,
        address: address,
        balance: balanceEther,
        tokenBalance: `${tokenBalance} ${tokenSymbol}`
      });
    }
    console.info("\nAccount Details:");
    console.info("================");
    accounts.forEach(({ index, privateKey, address, balance, tokenBalance }) => {
      console.info(`\nAccount ${index}: (${ACCOUNT_NAMES[index]})`);
      console.info(`Address:     ${address}`);
      console.info(`Private Key: ${privateKey}`);
      console.info(`Balance: ${balance} ETH`);
      console.info(`Token balance: ${tokenBalance}`);
    });
  });
