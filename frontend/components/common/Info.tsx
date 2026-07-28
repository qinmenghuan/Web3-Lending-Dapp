"use client";
import { formatUnits } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { useState } from "react";

const Info = () => {
  const { address } = useAccount();
  const [collateral, setCollateral] = useState(0);
  const [debt, setDebt] = useState(0);

  // default eth
  const { data } = useBalance({ address });
  const { data: rccTokenData } = useBalance({
    address,
    token: "0x6FCE5Dd421c88B7df4552E037362Bcea35Ae0AcB",
  });

  const { data: collateralTokenBalanceOf } = useBalance({
    address,
    token: "0x6f1CeA85c1BBFab5C9f8d2eb97F85a9e3697DA2E",
  });
  const { data: loanTokenBalanceOf } = useBalance({
    address,
    token: "0x9f327d53B0b6a6e97684305bEa9de9BF10Ec34a9",
  });

  // const lendingAbi = [
  //   {
  //     inputs: [
  //       {
  //         internalType: "uint256",
  //         name: "amount",
  //         type: "uint256",
  //       },
  //     ],
  //     name: "borrow",
  //     outputs: [],
  //     stateMutability: "nonpayable",
  //     type: "function",
  //   },
  //   {
  //     inputs: [
  //       {
  //         internalType: "uint256",
  //         name: "amount",
  //         type: "uint256",
  //       },
  //     ],
  //     name: "deposit",
  //     outputs: [],
  //     stateMutability: "nonpayable",
  //     type: "function",
  //   },
  //   {
  //     inputs: [
  //       {
  //         internalType: "uint256",
  //         name: "amount",
  //         type: "uint256",
  //       },
  //     ],
  //     name: "repay",
  //     outputs: [],
  //     stateMutability: "nonpayable",
  //     type: "function",
  //   },
  //   {
  //     inputs: [
  //       {
  //         internalType: "address",
  //         name: "_collateral",
  //         type: "address",
  //       },
  //       {
  //         internalType: "address",
  //         name: "_loan",
  //         type: "address",
  //       },
  //     ],
  //     stateMutability: "nonpayable",
  //     type: "constructor",
  //   },
  //   {
  //     anonymous: false,
  //     inputs: [
  //       {
  //         indexed: true,
  //         internalType: "address",
  //         name: "user",
  //         type: "address",
  //       },
  //       {
  //         indexed: false,
  //         internalType: "uint256",
  //         name: "amount",
  //         type: "uint256",
  //       },
  //     ],
  //     name: "Borrow",
  //     type: "event",
  //   },
  //   {
  //     anonymous: false,
  //     inputs: [
  //       {
  //         indexed: true,
  //         internalType: "address",
  //         name: "user",
  //         type: "address",
  //       },
  //       {
  //         indexed: false,
  //         internalType: "uint256",
  //         name: "amount",
  //         type: "uint256",
  //       },
  //     ],
  //     name: "Deposit",
  //     type: "event",
  //   },
  //   {
  //     anonymous: false,
  //     inputs: [
  //       {
  //         indexed: true,
  //         internalType: "address",
  //         name: "user",
  //         type: "address",
  //       },
  //       {
  //         indexed: false,
  //         internalType: "uint256",
  //         name: "amount",
  //         type: "uint256",
  //       },
  //     ],
  //     name: "Repay",
  //     type: "event",
  //   },
  //   {
  //     inputs: [],
  //     name: "collateralToken",
  //     outputs: [
  //       {
  //         internalType: "contract IERC20",
  //         name: "",
  //         type: "address",
  //       },
  //     ],
  //     stateMutability: "view",
  //     type: "function",
  //   },
  //   {
  //     inputs: [
  //       {
  //         internalType: "address",
  //         name: "user",
  //         type: "address",
  //       },
  //     ],
  //     name: "healthFactor",
  //     outputs: [
  //       {
  //         internalType: "uint256",
  //         name: "",
  //         type: "uint256",
  //       },
  //     ],
  //     stateMutability: "view",
  //     type: "function",
  //   },
  //   {
  //     inputs: [],
  //     name: "loanToken",
  //     outputs: [
  //       {
  //         internalType: "contract IERC20",
  //         name: "",
  //         type: "address",
  //       },
  //     ],
  //     stateMutability: "view",
  //     type: "function",
  //   },
  //   {
  //     inputs: [],
  //     name: "LTV",
  //     outputs: [
  //       {
  //         internalType: "uint256",
  //         name: "",
  //         type: "uint256",
  //       },
  //     ],
  //     stateMutability: "view",
  //     type: "function",
  //   },
  //   {
  //     inputs: [
  //       {
  //         internalType: "address",
  //         name: "",
  //         type: "address",
  //       },
  //     ],
  //     name: "positions",
  //     outputs: [
  //       {
  //         internalType: "uint256",
  //         name: "collateral",
  //         type: "uint256",
  //       },
  //       {
  //         internalType: "uint256",
  //         name: "debt",
  //         type: "uint256",
  //       },
  //     ],
  //     stateMutability: "view",
  //     type: "function",
  //   },
  // ];
  // const result = useReadContract({
  //   abi: lendingAbi,
  //   address: "0x567cE527D917835c952E838758Cf9Aa084E8a687",
  //   functionName: "positions",
  //   args: ["0x72d65507184DEb402C9cb416cBc44C5FA268C7fb"],
  // });
  // console.log("result", result?.data);

  return (
    <div>
      <div>wallet address: {address}</div>
      {data && <div>ETH Balance: {formatUnits(data?.value, 18)}</div>}
      {rccTokenData && (
        <div>Rcc Balance: {formatUnits(rccTokenData?.value, 18)}</div>
      )}
      <div>
        collateral token balanceOf:{" "}
        {formatUnits(collateralTokenBalanceOf?.value || BigInt(0), 18)}
      </div>
      <div>
        loan token balanceOf:{" "}
        {formatUnits(loanTokenBalanceOf?.value || BigInt(0), 18)}
      </div>
      {/* <div>
        lending positions collateral :{" "}
        {formatUnits(result?.data?.[0] ?? BigInt(0), 18)}
      </div>
      <div>
        lending positions debt : {formatUnits(result?.data?.[1] ?? BigInt(0), 18)}
      </div> */}

      <div>collateral: {collateral}</div>
      <div>debt: {debt}</div>
    </div>
  );
};

export default Info;
