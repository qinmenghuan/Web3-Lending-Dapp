export interface MarketDetail {
  id: number;
  marketAddress: string | null;
  network: string;
  collateralTokenAddress: string;
  collateralTokenName: string;
  loanTokenAddress: string;
  loanTokenName: string;
  totalCollateralAmount: string;
  totalLoanAmount: string;
  totalLoanAmountDesc: string;
  totalDebtAmount: string;
  ltvBps: number;
  lltvDesc: string;
  txHash: string;
  timestamp: number;
  totalLiquidityDesc?: string;
  utilizationDesc?: string;
}


// unify supply and deposit to reuse the same input component and logic, since for user it's the same action just different label
export type FieldName = "supply" | "borrow" | "deposit";