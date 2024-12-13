import { task, types } from "hardhat/config";

import { ACCOUNT_NAMES } from "../test/constants";
import { TaskArguments } from "hardhat/types";

task("task:listAccounts", "Prints the list of accounts")
  .addParam("numaccounts", "Number of accounts to return (1-10)", 3, types.int)
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const numAccounts = Number(taskArguments.numaccounts);
    // Validate input
    if (numAccounts < 1 || numAccounts > 10) {
      throw new Error("Number of accounts must be between 1 and 10");
    }

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
      accounts.push({
        index: i,
        privateKey: privateKey,
        address: address,
        balance: balanceEther,
      });
    }
    console.info("\nAccount Details:");
    console.info("================");
    accounts.forEach(({ index, privateKey, address, balance }) => {
      console.info(`\nAccount ${index}: (${ACCOUNT_NAMES[index]})`);
      console.info(`Address:     ${address}`);
      console.info(`Private Key: ${privateKey}`);
      console.info(`Balance: ${balance} ETH`);
    });
  });
