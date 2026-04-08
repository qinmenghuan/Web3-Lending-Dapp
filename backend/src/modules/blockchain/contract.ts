import { ethers } from 'ethers';
import LoanABI from './LoanABI.json';
import MarketFactoryABI from './MarketFactoryABI.json';

export function getLoanContract(
  provider: ethers.Provider,
  contractAddress: string,
) {
  return new ethers.Contract(contractAddress, LoanABI, provider);
}

export function getMarketFactoryContract(provider: ethers.Provider) {
  return new ethers.Contract(
    process.env.MARKET_FACTORY_CONTRACT!,
    MarketFactoryABI,
    provider,
  );
}

export function getNewContract(
  provider: ethers.Provider,
  contractAddress: string,
  abi: any,
) {
  return new ethers.Contract(contractAddress, abi, provider);
}
