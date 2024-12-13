// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
// https://github.com/NomicFoundation/hardhat-boilerplate/blob/master/scripts/deploy.js

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();

  console.log("Token address:", tokenAddress);

  // We also save the contract's artifacts and address in the frontend directory
  await saveFrontendFiles(token);
}

async function saveFrontendFiles(token) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const tokenAddress = await token.getAddress();

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: tokenAddress }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });