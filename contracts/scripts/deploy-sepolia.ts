import { network } from "hardhat";
import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";

const SHOULD_VERIFY = process.env.VERIFY === "true";
const LTV_BPS = process.env.LTV_BPS ? Number(process.env.LTV_BPS) : 7500;

function getFeeOverrides() {
  const maxFeePerGas = process.env.MAX_FEE_PER_GAS;
  const maxPriorityFeePerGas = process.env.MAX_PRIORITY_FEE_PER_GAS;
  const gasPrice = process.env.GAS_PRICE;

  if (gasPrice !== undefined && gasPrice !== "") {
    return { gasPrice: BigInt(gasPrice) };
  }

  if (
    maxFeePerGas !== undefined &&
    maxFeePerGas !== "" &&
    maxPriorityFeePerGas !== undefined &&
    maxPriorityFeePerGas !== ""
  ) {
    return {
      maxFeePerGas: BigInt(maxFeePerGas),
      maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas),
    };
  }

  return {};
}

async function deployAndWait<T extends { waitForDeployment(): Promise<unknown>; getAddress(): Promise<string> }>(
  label: string,
  deployer: () => Promise<T>,
) {
  console.log(`Deploying ${label}...`);
  const contract = await deployer();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`${label}: ${address}`);
  return contract;
}

async function maybeVerify(
  address: string,
  constructorArgs: unknown[],
  fullyQualifiedName?: string,
) {
  if (!SHOULD_VERIFY) {
    return;
  }

  try {
    await verifyContract(
      {
        address,
        constructorArgs,
        provider: "etherscan",
        ...(fullyQualifiedName !== undefined
          ? { contract: fullyQualifiedName }
          : {}),
      },
      await import("hardhat"),
    );
    console.log(`Verified: ${address}`);
  } catch (error) {
    console.error(`Verify failed for ${address}:`, error);
  }
}

const { ethers } = await network.connect("sepolia");
const [deployer] = await ethers.getSigners();
const feeOverrides = getFeeOverrides();

console.log("Network: sepolia");
console.log("Deployer:", deployer.address);
console.log("LTV_BPS:", LTV_BPS);
console.log("Fee overrides:", feeOverrides);

const MockERC20 = await ethers.getContractFactory("MockERC20", deployer);
const MarketFactory = await ethers.getContractFactory("MarketFactory", deployer);
const LendingMarket = await ethers.getContractFactory("LendingMarket", deployer);

const collateralToken = await deployAndWait("CollateralToken", () =>
  MockERC20.deploy("Collateral Token", "COLL", feeOverrides),
);

const loanToken = await deployAndWait("LoanToken", () =>
  MockERC20.deploy("Loan Token", "LOAN", feeOverrides),
);

const marketFactory = await deployAndWait("MarketFactory", () =>
  MarketFactory.deploy(feeOverrides),
);

const collateralAddress = await collateralToken.getAddress();
const loanAddress = await loanToken.getAddress();
const marketFactoryAddress = await marketFactory.getAddress();

console.log("Deploying LendingMarket...");
const lendingMarket = await LendingMarket.deploy(
  collateralAddress,
  loanAddress,
  LTV_BPS,
  marketFactoryAddress,
  feeOverrides,
);
await lendingMarket.waitForDeployment();
const lendingMarketAddress = await lendingMarket.getAddress();
console.log(`LendingMarket: ${lendingMarketAddress}`);

console.log("");
console.log("Deployment summary");
console.log("CollateralToken:", collateralAddress);
console.log("LoanToken:", loanAddress);
console.log("MarketFactory:", marketFactoryAddress);
console.log("LendingMarket:", lendingMarketAddress);

await maybeVerify(
  collateralAddress,
  ["Collateral Token", "COLL"],
  "contracts/MockERC20.sol:MockERC20",
);
await maybeVerify(
  loanAddress,
  ["Loan Token", "LOAN"],
  "contracts/MockERC20.sol:MockERC20",
);
await maybeVerify(
  marketFactoryAddress,
  [],
  "contracts/MarketFactory.sol:MarketFactory",
);
await maybeVerify(
  lendingMarketAddress,
  [collateralAddress, loanAddress, LTV_BPS, marketFactoryAddress],
  "contracts/LendingMarket.sol:LendingMarket",
);
