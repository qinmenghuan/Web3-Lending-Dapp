import { formatUnits } from "viem/utils";

export const toBigInt = (value?: string) => {
  try {
    return BigInt(value ?? "0");
  } catch {
    return BigInt(0);
  }
};

export const getTokenBadge = (tokenName: string) => {
  const upper = tokenName.toUpperCase();

  if (upper.includes("BTC")) {
    return "B";
  }

  if (upper.includes("USD")) {
    return "$";
  }

  return upper.slice(0, 1);
};

// format amount with suffixes and handle edge cases like non-finite numbers, negative values, and very small or large numbers, to ensure the displayed amounts are user-friendly and consistent.
export const formatAmount = (value: number, maximumFractionDigits = 4) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  });
};

export const toDisplayAmount = (value: bigint, decimals = 18) => {
  return Number(formatUnits(value, decimals));
};

export const toInputValue = (value: number, decimals: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return value.toFixed(decimals).replace(/\.?0+$/, "");
};

// 格式化用户输入，限制为数字和小数点，并且根据不同的字段限制小数位数，同时去除前导零，确保输入合法且符合预期格式
export const normalizeAmountInput = (value: string, decimals: number) => {
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
