// Imports
// ========================================================
import { ethers } from "ethers";
import ABI from "./abi.json";

// Helpers
// ========================================================
/**
 * 
 * @returns random integer of 16 digits between 1000000000000000 and 2000000000000000
 */
const randomInteger16Digits = () => {
  return Math.floor(Math.random() * (2000000000000000 - 1000000000000000 + 1) + 1000000000000000);
};

// Main Script
// ========================================================
const main = async () => {
  // Configure provider for defaul localhost
  const provider = new ethers.JsonRpcProvider();

  // Import wallet private key to create wallet instance
  const signInKey = new ethers.SigningKey(`${process.env.WALLET_PRIVATE_KEY}`);
  const wallet = new ethers.BaseWallet(signInKey, provider);

  // Configure contract instance
  const contractAddress = `${process.env.CONTRACT_ADDRESS_HEARTBEAT}`;
  const contract = new ethers.Contract(contractAddress, ABI.abi, wallet);

  // Write to contract
  const writeTx = await contract.write(1234567890123458); // 16 digits - ex 1234567890123456
  await writeTx.wait();
  console.log({ writeTx });

  // Verify read
  const readTx = await contract.read();
  // console.log({ readTx });
  console.log({ value: readTx[0] });
  console.log({ entryTimestamp: readTx[1] });

  // Create interval to write to contract randomly
  setInterval(async () => {
    const randNumber = randomInteger16Digits();
    const writeTx = await contract.write(randNumber); // 16 digits
    await writeTx.wait();
    console.log({ randNumber });
  }, 5000);
};

// Init
// ========================================================
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
