import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  console.log("Signer 0 (owner):", signers[0].address);
  console.log("Signer 1 (user):", signers[1].address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});