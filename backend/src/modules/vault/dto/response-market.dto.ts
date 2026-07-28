export class ResponseMarketDto {
  id: number;
  marketAddress: string | null; // 市场地址
  network: string;
  collateralTokenAddress: string; // 抵押品代币地址
  collateralTokenName: string;
  loanTokenAddress: string; // 贷款代币地址
  loanTokenName: string;
  totalCollateralAmount: string;
  totalLoanAmount: string;
  totalLoanAmountDesc: string; // 转成字符串类型，避免前端精度问题
  totalDebtAmount: string;
  ltvBps: number;
  lltvDesc: string;
  txHash: string;
  timestamp: number;
  totalLiquidityDesc?: string; // 可选字段，表示市场的总流动性
  utilizationDesc?: string; // 可选字段，表示市场的利用率
}

export class ResponseMarketDetailDto {
  id: number;
  marketAddress: string | null; // 市场地址
  network: string;
  collateralTokenAddress: string; // 抵押品代币地址
  collateralTokenName: string;
  loanTokenAddress: string; // 贷款代币地址
  loanTokenName: string;
  totalCollateralAmount: string;
  totalLoanAmount: string;
  totalLoanAmountDesc: string; // 转成字符串类型，避免前端精度问题
  totalDebtAmount: string;
  ltvBps: number;
  lltvDesc: string;
  txHash: string;
  timestamp: number;
  totalLiquidityDesc?: string; // 可选字段，表示市场的总流动性
  utilizationDesc?: string; // 可选字段，表示市场的利用率
}
