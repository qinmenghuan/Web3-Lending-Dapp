import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  provider: ethers.JsonRpcApiProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  }

  getProvider() {
    return this.provider;
  }
}
