"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BaseError, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient, // to wait for transaction receipt after write contract
  useReadContract,
  useWriteContract,
} from "wagmi";

import { Button } from "@/components/ui/button";
import { getMarketById } from "@/lib/market";
import { cn, getErrorMessage, toBigInt, getTokenBadge } from "@/lib/utils";
import { erc20Abi, marketAbi } from "@/lib/const";
import AmountPanel from "../../components/AmountPanel";
import SummaryRow from "../../components/SummaryRow";

interface MarketDetail {
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
type FieldName = "supply" | "borrow" | "deposit";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// define different input decimals for supply and borrow fields
const INPUT_DECIMALS: Record<FieldName, number> = {
  supply: 8,
  borrow: 6,
  deposit: 8,
};

const lendingMarketAbi = [
  {
    type: "function",
    name: "getUserPosition",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "depositAmount", type: "uint256" },
      { name: "collateralAmount", type: "uint256" },
      { name: "debtAmount", type: "uint256" },
      { name: "maxBorrowAmount", type: "uint256" },
      { name: "availableToBorrow", type: "uint256" },
    ],
  },
] as const;

// format amount with suffixes and handle edge cases like non-finite numbers, negative values, and very small or large numbers, to ensure the displayed amounts are user-friendly and consistent.
const formatAmount = (value: number, maximumFractionDigits = 4) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  });
};

const toDisplayAmount = (value: bigint, decimals = 18) => {
  return Number(formatUnits(value, decimals));
};

const toInputValue = (value: number, decimals: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return value.toFixed(decimals).replace(/\.?0+$/, "");
};

// 格式化用户输入，限制为数字和小数点，并且根据不同的字段限制小数位数，同时去除前导零，确保输入合法且符合预期格式
const normalizeAmountInput = (value: string, decimals: number) => {
  const sanitized = value.replace(/[^\d.]/g, "");

  if (!sanitized) {
    return "";
  }

  const [integerPart, ...decimalParts] = sanitized.split(".");
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "") || "0";

  if (decimalParts.length === 0) {
    return sanitized.endsWith(".")
      ? `${normalizedInteger}.`
      : normalizedInteger;
  }

  return `${normalizedInteger}.${decimalParts.join("").slice(0, decimals)}`;
};

const Deposit = ({
  marketId,
  className,
}: {
  marketId: string;
  className?: string;
}) => {
  const [market, setMarket] = useState<MarketDetail | null>(null);
  // form state
  // const [supplyAmount, setSupplyAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  // const [borrowAmount, setBorrowAmount] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // address and isConnected state from wagmi
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    // fetch market detail
    const fetchMarket = async () => {
      const response = await getMarketById(Number(marketId));
      console.log("lend market", response);
      setMarket(response);
    };

    fetchMarket();
  }, [marketId]);

  const collateralTokenAddress = market?.collateralTokenAddress as
    | `0x${string}`
    | undefined;
  const loanTokenAddress = market?.loanTokenAddress as
    | `0x${string}`
    | undefined;
  const marketAddress = market?.marketAddress as `0x${string}` | undefined;

  // const { data: collateralBalanceData } = useBalance({
  //   address,
  //   token: collateralTokenAddress,
  //   query: {
  //     enabled: Boolean(address && collateralTokenAddress),
  //   },
  // });

  const { data: loanBalanceData } = useBalance({
    address,
    token: loanTokenAddress,
    query: {
      // only fetch loan token balance when user connected and loan token address exist
      enabled: Boolean(address && loanTokenAddress),
    },
  });

  // fetch user's current position in the market, including their existing collateral, debt, and available borrow amount,
  const { data: userPosition } = useReadContract({
    abi: lendingMarketAbi,
    address: marketAddress,
    functionName: "getUserPosition",
    args: [address ?? ZERO_ADDRESS],
    query: {
      enabled: Boolean(address && marketAddress),
    },
  });

  // allowance for collateral token to check if approval is needed before supply
  const { data: collateralAllowance, refetch: refetchAllowance } =
    useReadContract({
      abi: erc20Abi,
      address: collateralTokenAddress,
      functionName: "allowance",
      args: address && marketAddress ? [address, marketAddress] : undefined,
      query: {
        // only fetch allowance when user connected and market & collateral token exist
        enabled: Boolean(address && collateralTokenAddress && marketAddress),
      },
    });

  // const supplyValue = Number(supplyAmount || "0");
  // depositValue is number type of the deposit input
  const depositValue = Number(depositAmount || "0");
  // const borrowValue = Number(borrowAmount || "0");
  // const collateralBalance = Number(collateralBalanceData?.formatted ?? "0");
  // const collateralDecimals = collateralBalanceData?.decimals ?? 18;
  const loanDecimals = loanBalanceData?.decimals ?? 18;
  const loanBalance = Number(loanBalanceData?.formatted ?? "0");

  const existingCollateral = toDisplayAmount(userPosition?.[1] ?? BigInt(0));
  const existingDebt = toDisplayAmount(userPosition?.[2] ?? BigInt(0));
  const existingAvailableToBorrow = toDisplayAmount(
    userPosition?.[4] ?? BigInt(0),
  );

  // calculate market liquidity based on total loan and total debt
  const marketLiquidity = useMemo(() => {
    if (!market) {
      return 0;
    }

    if (market.totalLiquidityDesc) {
      const numericLiquidity = Number(market.totalLiquidityDesc);
      return Number.isFinite(numericLiquidity) ? numericLiquidity : 0;
    }

    const totalLoan = toBigInt(market.totalLoanAmount);
    const totalDebt = toBigInt(market.totalDebtAmount);

    return toDisplayAmount(
      totalLoan > totalDebt ? totalLoan - totalDebt : BigInt(0),
    );
  }, [market]);

  const ltvRatio = useMemo(() => {
    if (!market) {
      return 0;
    }

    return market.ltvBps / 10000;
  }, [market]);

  // const addedBorrowCapacity = supplyValue * ltvRatio;
  // const maxBorrowAmount = Math.max(
  //   0,
  //   Math.min(existingAvailableToBorrow + addedBorrowCapacity, marketLiquidity),
  // );

  // validate input values and return error messages for each field, this will be used to show error state in the UI and disable submit button if there are errors
  // will only recompute the memoized value when one of the deps has changed.
  const errors = useMemo(() => {
    const nextErrors: Record<FieldName, string> = {
      supply: "",
      borrow: "",
      deposit: "",
    };

    if (depositAmount) {
      if (depositValue <= 0) {
        nextErrors.deposit = "Deposit amount must be greater than 0.";
      } else if (isConnected && depositValue > loanBalance) {
        nextErrors.deposit = `Deposit exceeds wallet balance (${formatAmount(loanBalance)}).`;
      }
    }

    return nextErrors;
  }, [depositAmount, depositValue, loanBalance, isConnected, marketLiquidity]);

  const hasAmount = Boolean(depositAmount);
  const hasErrors = Boolean(errors.deposit);
  const canSubmit = Boolean(
    market && isConnected && hasAmount && !hasErrors && !isSubmitting,
  );

  const projectedCollateral = existingCollateral;
  const projectedDebt = existingDebt;
  const projectedLtv =
    projectedCollateral > 0 ? (projectedDebt / projectedCollateral) * 100 : 0;

  const collateralLabel = market?.collateralTokenName ?? "Collateral";
  const loanLabel = market?.loanTokenName ?? "Loan";

  const actionLabel = !isConnected
    ? "Connect wallet to continue"
    : !hasAmount
      ? "Enter an amount"
      : hasErrors
        ? "Fix form errors"
        : isSubmitting
          ? "Submitting..."
          : depositValue > 0
            ? `Deposit ${collateralLabel}`
            : `Deposit ${collateralLabel}`;

  // handle input change and max click for both supply and borrow fields
  const handleAmountChange = (field: FieldName, value: string) => {
    // normalize input value to ensure it's a valid number with correct decimals, and prevent invalid characters
    const nextValue = normalizeAmountInput(value, INPUT_DECIMALS[field]);

    if (field === "deposit") {
      setDepositAmount(nextValue);
      return;
    }
  };

  // when user click max, set the input value to the maximum they can deposit, which is their wallet balance for supply, and the market liquidity or their borrow limit for borrow
  const handleMaxClick = (field: FieldName) => {
    if (field === "deposit") {
      setDepositAmount(toInputValue(loanBalance, INPUT_DECIMALS.deposit));
      return;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // event.preventDefault();
    // // check
    // if (!canSubmit || !market || !address || !marketAddress || !publicClient) {
    //   return;
    // }
    // // clear state data before submit
    // setSubmitError("");
    // setSubmitSuccess("");
    // setIsSubmitting(true);
    // try {
    //   // supply collateral if needed
    //   if (supplyValue > 0) {
    //     // check collateralTokenAddress
    //     if (!collateralTokenAddress) {
    //       throw new Error("Missing collateral token address.");
    //     }
    //     // parse amount to correct decimals
    //     const collateralAmount = parseUnits(supplyAmount, collateralDecimals);
    //     // check allowance and approve if needed
    //     const allowance = collateralAllowance ?? BigInt(0);
    //     // if allowance not enough, approve max uint256 to avoid multiple approval in future
    //     if (allowance < collateralAmount) {
    //       const approveHash = await writeContractAsync({
    //         abi: erc20Abi,
    //         address: collateralTokenAddress,
    //         functionName: "approve",
    //         args: [marketAddress, collateralAmount],
    //       });
    //       // wait for approval tx to be mined before supply, otherwise the supply tx will fail
    //       await publicClient.waitForTransactionReceipt({ hash: approveHash });
    //       // refetch allowance to update UI, although we already know the new allowance will be max uint256, this can ensure the UI state is consistent with blockchain state
    //       await refetchAllowance();
    //     }
    //     // then supply collateral to the market
    //     const supplyHash = await writeContractAsync({
    //       abi: marketAbi,
    //       address: marketAddress,
    //       functionName: "supplyCollateral",
    //       args: [collateralAmount],
    //     });
    //     // wait for supply tx to be mined before show success, otherwise the user may see the success message but the transaction is still pending, which can cause confusion
    //     await publicClient.waitForTransactionReceipt({ hash: supplyHash });
    //   }
    //   if (borrowValue > 0) {
    //     const borrowAmountParsed = parseUnits(borrowAmount, loanDecimals);
    //     const borrowHash = await writeContractAsync({
    //       abi: marketAbi,
    //       address: marketAddress,
    //       functionName: "borrow",
    //       args: [borrowAmountParsed],
    //     });
    //     await publicClient.waitForTransactionReceipt({ hash: borrowHash });
    //   }
    //   setSubmitSuccess("Transaction confirmed.");
    //   setSupplyAmount("");
    //   setBorrowAmount("");
    // } catch (error) {
    //   console.error("lend submit failed", error);
    //   setSubmitError(getErrorMessage(error));
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  if (!market) {
    return (
      <div
        className={cn(
          "w-full max-w-[420px] rounded-[32px] border border-border bg-card p-6",
          className,
        )}
      >
        Loading...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full max-w-[420px] space-y-4", className)}
    >
      <Button
        type="button"
        variant="outline"
        className="rounded-xl px-5 py-5 text-base"
      >
        Deposit
      </Button>

      <AmountPanel
        label="Deposit"
        tokenName={loanLabel}
        amount={depositAmount}
        error={errors.deposit}
        secondaryText="$0.00"
        availableText={`${formatAmount(loanBalance)} ${loanLabel}`}
        badge={getTokenBadge(loanLabel)}
        active
        onAmountChange={(value) => handleAmountChange("deposit", value)}
        onMaxClick={() => handleMaxClick("deposit")}
      />

      <div className="rounded-[28px] border border-border bg-card p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Network</span>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="h-3 w-3 rounded-[2px] bg-blue-600" />
            <span>{market.network}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* <SummaryRow
            label={`Collateral (${collateralLabel})`}
            value={formatAmount(projectedCollateral)}
            badge={
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-500 text-[10px] font-semibold text-blue-600">
                {getTokenBadge(collateralLabel)}
              </span>
            }
          /> */}
          <SummaryRow
            label={`Loan (${loanLabel})`}
            value={`${formatAmount(projectedDebt)} -> 0`}
            badge={
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-500 text-[10px] font-semibold text-blue-600">
                {getTokenBadge(loanLabel)}
              </span>
            }
          />
          <SummaryRow label="APY" value={`${formatAmount(projectedLtv, 2)}%`} />
          <SummaryRow
            label="Projected monthly earnings"
            value={market.lltvDesc}
          />
          <SummaryRow label="Projected yearly earnings" value="--" />
        </div>
      </div>

      {submitError ? (
        <p className="text-sm text-red-500">{submitError}</p>
      ) : null}
      {submitSuccess ? (
        <p className="text-sm text-emerald-600">{submitSuccess}</p>
      ) : null}

      <Button
        type="submit"
        className="h-14 w-full rounded-2xl bg-secondary text-lg text-muted-foreground hover:bg-secondary/90"
        disabled={!canSubmit}
      >
        {actionLabel}
      </Button>
    </form>
  );
};

export default Deposit;
