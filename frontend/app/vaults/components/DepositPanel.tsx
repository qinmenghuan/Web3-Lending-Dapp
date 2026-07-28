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
import AmountPanel from "@/components/common/AmountPanel";
import SummaryRow from "@/components/common/SummaryRow";
import { getMarketById } from "@/api/markets";
import { toBigInt, getTokenBadge } from "@/utils/amount";
import { getErrorMessage } from "@/utils/errors";
import { cn } from "@/utils/styles";
import { erc20Abi, marketAbi } from "@/web3/abis";
import { ZERO_ADDRESS } from "@/lib/constants";
import { MarketDetail, FieldName } from "@/types";
import {
  formatAmount,
  toDisplayAmount,
  toInputValue,
  normalizeAmountInput,
} from "@/utils/amount";

// define different input decimals for supply and borrow fields
const INPUT_DECIMALS: Record<FieldName, number> = {
  supply: 8,
  borrow: 6,
  deposit: 8,
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
  const [depositAmount, setDepositAmount] = useState("");
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

  const { data: collateralBalanceData } = useBalance({
    address,
    token: collateralTokenAddress,
    query: {
      enabled: Boolean(address && collateralTokenAddress),
    },
  });

  const {
    data: loanBalanceData,
    error: loanBalanceError,
    refetch: refetchLoanBalance,
  } = useBalance({
    address,
    token: loanTokenAddress,
    query: {
      // only fetch loan token balance when user connected and loan token address exist
      enabled: Boolean(address && loanTokenAddress),
    },
  });

  // fetch user's current position in the market, including their existing collateral, debt, and available borrow amount,
  const { data: userPosition } = useReadContract({
    abi: marketAbi,
    // abi: lendingMarketAbi,
    address: marketAddress,
    functionName: "getUserPosition",
    args: [address ?? ZERO_ADDRESS],
    query: {
      enabled: Boolean(address && marketAddress),
    },
  });

  // allowance for loan token to check if approval is needed before supply
  // 中文注释：loanAllowance用户对市场合约的授权额度
  const { data: loanAllowance, refetch: refetchLoanAllowance } =
    useReadContract({
      abi: erc20Abi,
      address: loanTokenAddress,
      functionName: "allowance",
      args: address && marketAddress ? [address, marketAddress] : undefined,
      query: {
        // only fetch allowance when user connected and market & collateral token exist
        enabled: Boolean(address && loanTokenAddress && marketAddress),
      },
    });

  // const supplyValue = Number(supplyAmount || "0");
  // depositValue is number type of the deposit input
  const depositValue = Number(depositAmount || "0");
  const loanDecimals = loanBalanceData?.decimals ?? 18;
  const loanBalance = Number(loanBalanceData?.formatted ?? "0");

  const existingCollateral = toDisplayAmount(userPosition?.[1] ?? BigInt(0));
  const existingDebt = toDisplayAmount(userPosition?.[2] ?? BigInt(0));

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
            ? `Deposit ${loanLabel}`
            : `Deposit ${loanLabel}`;

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
    event.preventDefault();
    // check
    if (!canSubmit || !market || !address || !marketAddress || !publicClient) {
      return;
    }
    // clear state data before submit
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);

    console.log("depositAmount23234", depositAmount);

    try {
      if (depositValue > 0) {
        // 校验借款地址
        if (!loanTokenAddress) {
          throw new Error("Invalid loan token address.");
        }

        // parse amount to correct decimals 质押金额
        const loanAmount = parseUnits(depositAmount, loanDecimals);
        // check allowance and approve if needed
        const allowance = loanAllowance ?? BigInt(0);
        console.log(
          "allowance222",
          allowance.toString(),
          "loanAmount222",
          loanAmount.toString(),
        );
        // 校验借款代币的授权金额
        // if allowance not enough, approve max uint256 to avoid multiple approval in future
        if (allowance < loanAmount) {
          const approveHash = await writeContractAsync({
            abi: erc20Abi,
            address: loanTokenAddress,
            functionName: "approve",
            args: [marketAddress, loanAmount],
          });
          // wait for approval tx to be mined before supply, otherwise the supply tx will fail
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
          // refetch allowance to update UI, although we already know the new allowance will be max uint256, this can ensure the UI state is consistent with blockchain state
          // 中文注释
          await refetchLoanAllowance();
        }
        console.log("marketAddress222", marketAddress);
        const depositHash = await writeContractAsync({
          abi: marketAbi,
          address: marketAddress,
          functionName: "deposit",
          args: [loanAmount],
        });
        // wait for supply tx to be mined before show success, otherwise the user may see the success message but the transaction is still pending, which can cause confusion
        await publicClient.waitForTransactionReceipt({ hash: depositHash });
        // refetch loan balance to update UI after deposit, although we already know the new balance will be reduced by depositAmount, this can ensure the UI state is consistent with blockchain state
        await refetchLoanBalance();
        setSubmitSuccess("Transaction confirmed.");
        setDepositAmount("");
      }
    } catch (error) {
      console.error("lend submit failed", error);
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
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
