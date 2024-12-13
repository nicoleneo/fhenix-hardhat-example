/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import hre, { ethers, fhenixjs } from "hardhat";
import { Token } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  createPermissionForContract,
  getTokensFromFaucet,
} from "../utils/instance";
import { AddressLike } from "ethers";

describe("Token", function () {
  let signer: SignerWithAddress;

  let token: Token;
  let tokenAddress: string;

  before(async () => {
    signer = (await ethers.getSigners())[0];
    await getTokensFromFaucet(hre, signer.address);

    const tokenFactory = await ethers.getContractFactory("Token");
    token = await tokenFactory.deploy();
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();
  });

  describe("Deployment", function () {
    it("should have named accounts resolved", async function () {
      const namedAccounts = await hre.getNamedAccounts();
      expect(namedAccounts).to.have.keys(["deployer", "bob", "carol"]);
    });

    it("Should have the correct balance for the deployer on deploy", async function () {
      const signerAddress: AddressLike = signer.address;
      const signerTokenBalance = await token.balanceOf(signerAddress);
      const totalSupply = await token.totalSupply();
      expect(signerTokenBalance).to.equal(totalSupply);
    });

    it("Should have the correct balance for the other accounts", async function () {
      const accounts = await ethers.getSigners();
      const account1 = accounts[1];
      const account2 = accounts[2];
      const account1Address: AddressLike = account1.address;
      const account2Address: AddressLike = account2.address;
      const account1Balance = await token.balanceOf(account1Address);
      const account2Balance = await token.balanceOf(account2Address);

      expect(account1Balance).to.equal(0n);
      expect(account2Balance).to.equal(0n);
    });

    it("Should have the correct balance after transferring", async function () {
      const accounts = await ethers.getSigners();
      const account1 = accounts[1];
      const signerAddress: AddressLike = signer.address;
      let signerTokenBalance = await token.balanceOf(signerAddress);
      const account1Address: AddressLike = account1.address;
      let account1Balance = await token.balanceOf(account1Address);
      const transferAmount = 100n;

      const transferFunction = token.getFunction(
        "transfer(address,address,uint256)",
      );
      await transferFunction(signerAddress, account1, transferAmount);

      const expectedSignerTokenBalance = signerTokenBalance - transferAmount;
      const expectedAccount1TokenBalance = account1Balance + transferAmount;

      signerTokenBalance = await token.balanceOf(signerAddress);
      account1Balance = await token.balanceOf(account1Address);

      expect(signerTokenBalance).to.equal(expectedSignerTokenBalance);
      expect(account1Balance).to.equal(expectedAccount1TokenBalance);
    });
  });
});
