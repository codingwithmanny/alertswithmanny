// Imports
// ========================================================
import { ethers } from "hardhat";

// Imports
// ========================================================
async function main() {
  // Deploy HeartBeat Contract
  const HeartBeatContract = await ethers.deployContract("HeartBeat");
  const heartBeatContractDeployed = await HeartBeatContract.waitForDeployment();
  console.log(
    `HeartBeat Contract deployed to ${heartBeatContractDeployed.target}`
  );

  // Deploy API Contract
  const dAPIFeedContract = await ethers.deployContract("DAPIFeed");
  const DAPIFeedContractDeployed = await dAPIFeedContract.waitForDeployment();
  console.log(
    `DAPIFeed Contract deployed to ${DAPIFeedContractDeployed.target}`
  );

  // Set Proxy Address
  const txSet = await dAPIFeedContract.setProxyAddress(
    `${heartBeatContractDeployed.target}`
  );
  txSet.wait();
  // console.log({ tx })

  // Read from Proxy Contract
  const txProxyRead = await dAPIFeedContract.proxyAddress();
  console.log({ txProxyRead });

  const txRead = await dAPIFeedContract.readDataFeed();
  console.log({ txRead });
}

// Init
// ========================================================
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
