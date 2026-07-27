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
