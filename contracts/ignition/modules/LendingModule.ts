// import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// export default buildModule("LendingModule", (m) => {
//   const collateralToken = m.contractAt(
//     "IERC20",
//     "0x4798388e3adE569570Df626040F07DF71135C48E",
//   );

//   const loanToken = m.contractAt(
//     "IERC20",
//     "0x5A4eA3a013D42Cfd1B1609d19f6eA998EeE06D30",
//   );

//   const lendingMarket = m.contract(
//     "LendingMarket",
//     [collateralToken, loanToken],
//     {
//       id: "LendingMarket",
//     },
//   );

//   return { collateralToken, loanToken, lendingMarket };
// });

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LendingModule", (m) => {
  const collateralToken = m.contractAt(
    "IERC20",
    "0x4798388e3adE569570Df626040F07DF71135C48E",
    { id: "LendingModule_IERC20_Collateral" },
  );

  const loanToken = m.contractAt(
    "IERC20",
    "0x5A4eA3a013D42Cfd1B1609d19f6eA998EeE06D30",
    { id: "LendingModule_IERC20_Loan" },
  );

  const lendingMarket = m.contract(
    "LendingMarket",
    [collateralToken, loanToken],
    { id: "LendingModule_LendingMarket" },
  );

  return { collateralToken, loanToken, lendingMarket };
});
