import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { config as loadEnv } from "dotenv";
import { ethers } from "ethers";

loadEnv();

const rootDir = process.cwd();
const artifactDir = path.join(rootDir, "artifacts", "contracts");

function requiredEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function readArtifact(sourceName, contractName) {
  const artifactPath = path.join(
    artifactDir,
    sourceName,
    `${contractName}.json`,
  );
  const raw = await fs.readFile(artifactPath, "utf8");
  return JSON.parse(raw);
}

function getFeeOverrides() {
  const gasPrice = process.env.GAS_PRICE;
  const maxFeePerGas = process.env.MAX_FEE_PER_GAS;
  const maxPriorityFeePerGas = process.env.MAX_PRIORITY_FEE_PER_GAS;

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

async function deployContract(label, artifact, signer, args, overrides) {
  console.log(`Deploying ${label}...`);
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer,
  );
  const contract = await factory.deploy(...args, overrides);
  console.log(`${label} tx: ${contract.deploymentTransaction().hash}`);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`${label}: ${address}`);
  return { contract, address };
}

const rpcUrl = requiredEnv("SEPOLIA_RPC_URL");
const privateKey = requiredEnv("SEPOLIA_PRIVATE_KEY");
const ltvBps = process.env.LTV_BPS ? Number(process.env.LTV_BPS) : 7500;

const provider = new ethers.JsonRpcProvider(rpcUrl, 11155111);
const wallet = new ethers.Wallet(privateKey, provider);
const feeOverrides = getFeeOverrides();

console.log("Network: sepolia");
console.log("RPC host:", new URL(rpcUrl).host);
console.log("Deployer:", wallet.address);
console.log("LTV_BPS:", ltvBps);
console.log("Fee overrides:", feeOverrides);

const network = await provider.getNetwork();
console.log("Connected chainId:", network.chainId.toString());

const mockErc20Artifact = await readArtifact("MockERC20.sol", "MockERC20");
const marketFactoryArtifact = await readArtifact(
  "MarketFactory.sol",
  "MarketFactory",
);
const lendingMarketArtifact = await readArtifact(
  "LendingMarket.sol",
  "LendingMarket",
);

const collateralToken = await deployContract(
  "CollateralToken",
  mockErc20Artifact,
  wallet,
  ["Collateral Token", "COLL"],
  feeOverrides,
);

const loanToken = await deployContract(
  "LoanToken",
  mockErc20Artifact,
  wallet,
  ["Loan Token", "LOAN"],
  feeOverrides,
);

const marketFactory = await deployContract(
  "MarketFactory",
  marketFactoryArtifact,
  wallet,
  [],
  feeOverrides,
);

const lendingMarket = await deployContract(
  "LendingMarket",
  lendingMarketArtifact,
  wallet,
  [
    collateralToken.address,
    loanToken.address,
    ltvBps,
    marketFactory.address,
  ],
  feeOverrides,
);

console.log("");
console.log("Deployment summary");
console.log("CollateralToken:", collateralToken.address);
console.log("LoanToken:", loanToken.address);
console.log("MarketFactory:", marketFactory.address);
console.log("LendingMarket:", lendingMarket.address);

console.log("");
console.log("Manual verify commands");
console.log(
  `npx hardhat verify --network sepolia ${collateralToken.address} "Collateral Token" "COLL"`,
);
console.log(
  `npx hardhat verify --network sepolia ${loanToken.address} "Loan Token" "LOAN"`,
);
console.log(
  `npx hardhat verify --network sepolia ${marketFactory.address}`,
);
console.log(
  `npx hardhat verify --network sepolia ${lendingMarket.address} ${collateralToken.address} ${loanToken.address} ${ltvBps} ${marketFactory.address}`,
);
