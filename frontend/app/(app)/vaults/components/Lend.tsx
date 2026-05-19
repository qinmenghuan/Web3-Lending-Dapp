"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BaseError, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";

import { Button } from "@/components/ui/button";
import { getMarketById } from "@/lib/market";
import { cn } from "@/lib/utils";
import { erc20Abi, marketAbi } from "@/lib/const";

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

type FieldName = "supply" | "borrow";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const INPUT_DECIMALS: Record<FieldName, number> = {
  supply: 8,
  borrow: 6,
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

const getErrorMessage = (error: unknown) => {
  if (error instanceof BaseError) {
    return error.shortMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Transaction failed. Check wallet and contract params.";
};

const toBigInt = (value?: string) => {
  try {
    return BigInt(value ?? "0");
  } catch {
    return BigInt(0);
  }
};

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

const getTokenBadge = (tokenName: string) => {
  const upper = tokenName.toUpperCase();

  if (upper.includes("BTC")) {
    return "B";
  }

  if (upper.includes("USD")) {
    return "$";
  }

  return upper.slice(0, 1);
};

const AmountPanel = ({
  label,
  tokenName,
  amount,
  error,
  secondaryText,
  availableText,
  badge,
  onAmountChange,
  onMaxClick,
  active = false,
}: {
  label: string;
  tokenName: string;
  amount: string;
  error?: string;
  secondaryText: string;
  availableText: string;
  badge: string;
  onAmountChange: (value: string) => void;
  onMaxClick: () => void;
  active?: boolean;
}) => {
  return (
    <div
      className={cn(
        "rounded-[28px] border bg-card p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-colors",
        active
          ? "border-blue-400 shadow-[0_8px_24px_rgba(59,130,246,0.12)]"
          : "border-border",
        error ? "border-red-300" : "",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-lg font-medium text-foreground">
          {label} {tokenName}
        </p>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-500 text-sm font-semibold text-blue-600">
          {badge}
        </span>
      </div>

      <label className="block">
        <span className="sr-only">{label}</span>
        <input
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          inputMode="decimal"
          placeholder="0.00"
          aria-invalid={Boolean(error)}
          className="h-14 w-full border-0 bg-transparent p-0 text-5xl font-light text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
      </label>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{secondaryText}</span>
        <div className="flex items-center gap-3">
          <span>{availableText}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-full px-4 text-muted-foreground"
            onClick={onMaxClick}
          >
            MAX
          </Button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

const SummaryRow = ({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-foreground">
      <div className="flex items-center gap-2 text-muted-foreground">
        {badge}
        <span>{label}</span>
      </div>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
};

const Lend = ({
  marketId,
  className,
}: {
  marketId: string;
  className?: string;
}) => {
  const [market, setMarket] = useState<MarketDetail | null>(null);
  const [supplyAmount, setSupplyAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
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

  const { data: loanBalanceData } = useBalance({
    address,
    token: loanTokenAddress,
    query: {
      enabled: Boolean(address && loanTokenAddress),
    },
  });

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

  const supplyValue = Number(supplyAmount || "0");
  const borrowValue = Number(borrowAmount || "0");
  const collateralBalance = Number(collateralBalanceData?.formatted ?? "0");
  const collateralDecimals = collateralBalanceData?.decimals ?? 18;
  const loanDecimals = loanBalanceData?.decimals ?? 18;

  const existingCollateral = toDisplayAmount(userPosition?.[1] ?? BigInt(0));
  const existingDebt = toDisplayAmount(userPosition?.[2] ?? BigInt(0));
  const existingAvailableToBorrow = toDisplayAmount(
    userPosition?.[4] ?? BigInt(0),
  );

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

  const addedBorrowCapacity = supplyValue * ltvRatio;
  const maxBorrowAmount = Math.max(
    0,
    Math.min(existingAvailableToBorrow + addedBorrowCapacity, marketLiquidity),
  );

  const errors = useMemo(() => {
    const nextErrors: Record<FieldName, string> = {
      supply: "",
      borrow: "",
    };

    if (supplyAmount) {
      if (supplyValue <= 0) {
        nextErrors.supply = "Supply amount must be greater than 0.";
      } else if (isConnected && supplyValue > collateralBalance) {
        nextErrors.supply = `Supply exceeds wallet balance (${formatAmount(collateralBalance)}).`;
      }
    }

    if (borrowAmount) {
      if (borrowValue <= 0) {
        nextErrors.borrow = "Borrow amount must be greater than 0.";
      } else if (borrowValue > marketLiquidity) {
        nextErrors.borrow = `Borrow exceeds available liquidity (${formatAmount(marketLiquidity)}).`;
      } else if (borrowValue > maxBorrowAmount) {
        nextErrors.borrow = `Borrow exceeds current limit (${formatAmount(maxBorrowAmount)}).`;
      }
    }

    return nextErrors;
  }, [
    borrowAmount,
    borrowValue,
    collateralBalance,
    isConnected,
    marketLiquidity,
    maxBorrowAmount,
    supplyAmount,
    supplyValue,
  ]);

  const hasAmount = Boolean(supplyAmount || borrowAmount);
  const hasErrors = Boolean(errors.supply || errors.borrow);
  const canSubmit = Boolean(
    market && isConnected && hasAmount && !hasErrors && !isSubmitting,
  );

  const projectedCollateral = existingCollateral + supplyValue;
  const projectedDebt = existingDebt + borrowValue;
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
          : supplyValue > 0 && borrowValue > 0
            ? `Supply ${collateralLabel} and Borrow ${loanLabel}`
            : supplyValue > 0
              ? `Supply ${collateralLabel}`
              : `Borrow ${loanLabel}`;

  const handleAmountChange = (field: FieldName, value: string) => {
    const nextValue = normalizeAmountInput(value, INPUT_DECIMALS[field]);

    if (field === "supply") {
      setSupplyAmount(nextValue);
      return;
    }

    setBorrowAmount(nextValue);
  };

  const handleMaxClick = (field: FieldName) => {
    if (field === "supply") {
      setSupplyAmount(toInputValue(collateralBalance, INPUT_DECIMALS.supply));
      return;
    }

    setBorrowAmount(toInputValue(maxBorrowAmount, INPUT_DECIMALS.borrow));
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

    try {
      // supply collateral if needed
      if (supplyValue > 0) {
        // check collateralTokenAddress
        if (!collateralTokenAddress) {
          throw new Error("Missing collateral token address.");
        }

        // parse amount to correct decimals
        const collateralAmount = parseUnits(supplyAmount, collateralDecimals);
        // check allowance and approve if needed
        const allowance = collateralAllowance ?? BigInt(0);

        // if allowance not enough, approve max uint256 to avoid multiple approval in future
        if (allowance < collateralAmount) {
          const approveHash = await writeContractAsync({
            abi: erc20Abi,
            address: collateralTokenAddress,
            functionName: "approve",
            args: [marketAddress, collateralAmount],
          });

          // wait for approval tx to be mined before supply, otherwise the supply tx will fail
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
          // refetch allowance to update UI, although we already know the new allowance will be max uint256, this can ensure the UI state is consistent with blockchain state
          await refetchAllowance();
        }

        // then supply collateral to the market
        const supplyHash = await writeContractAsync({
          abi: marketAbi,
          address: marketAddress,
          functionName: "supplyCollateral",
          args: [collateralAmount],
        });

        // wait for supply tx to be mined before show success, otherwise the user may see the success message but the transaction is still pending, which can cause confusion
        await publicClient.waitForTransactionReceipt({ hash: supplyHash });
      }

      if (borrowValue > 0) {
        const borrowAmountParsed = parseUnits(borrowAmount, loanDecimals);
        const borrowHash = await writeContractAsync({
          abi: marketAbi,
          address: marketAddress,
          functionName: "borrow",
          args: [borrowAmountParsed],
        });

        await publicClient.waitForTransactionReceipt({ hash: borrowHash });
      }

      setSubmitSuccess("Transaction confirmed.");
      setSupplyAmount("");
      setBorrowAmount("");
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
        Borrow
      </Button>

      <AmountPanel
        label="Supply Collateral"
        tokenName={collateralLabel}
        amount={supplyAmount}
        error={errors.supply}
        secondaryText="$0.00"
        availableText={`${formatAmount(collateralBalance)} ${collateralLabel}`}
        badge={getTokenBadge(collateralLabel)}
        active
        onAmountChange={(value) => handleAmountChange("supply", value)}
        onMaxClick={() => handleMaxClick("supply")}
      />

      <AmountPanel
        label="Borrow"
        tokenName={loanLabel}
        amount={borrowAmount}
        error={errors.borrow}
        secondaryText="$0.00"
        availableText={`${formatAmount(maxBorrowAmount)} ${loanLabel}`}
        badge={getTokenBadge(loanLabel)}
        onAmountChange={(value) => handleAmountChange("borrow", value)}
        onMaxClick={() => handleMaxClick("borrow")}
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
          <SummaryRow
            label={`Collateral (${collateralLabel})`}
            value={formatAmount(projectedCollateral)}
            badge={
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-500 text-[10px] font-semibold text-blue-600">
                {getTokenBadge(collateralLabel)}
              </span>
            }
          />
          <SummaryRow
            label={`Loan (${loanLabel})`}
            value={formatAmount(projectedDebt)}
            badge={
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-500 text-[10px] font-semibold text-blue-600">
                {getTokenBadge(loanLabel)}
              </span>
            }
          />
          <SummaryRow label="LTV" value={`${formatAmount(projectedLtv, 2)}%`} />
          <SummaryRow label="Liquidation LTV" value={market.lltvDesc} />
          <SummaryRow label="Rate" value="--" />
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

export default Lend;
