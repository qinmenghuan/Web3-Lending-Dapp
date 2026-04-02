import { ethers } from 'ethers';
import LoanABI from './LoanABI.json';

export function getLoanContract(provider: ethers.Provider) {
  return new ethers.Contract(process.env.LOAN_CONTRACT!, LoanABI, provider);
}
