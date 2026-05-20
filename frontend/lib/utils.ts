import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BaseError } from "viem";

// Utility function to combine class names conditionally and handle Tailwind CSS conflicts.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format an Ethereum address by showing the first and last few characters, separated by ellipses.
export const formatAddress = (address: string, chars = 4) => {
  if (!address || address.length < chars * 2 + 2) {
    return address; // Return the original address if it's too short to format
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Format a numeric amount with appropriate suffixes (K for thousands, M for millions, B for billions).
export const getErrorMessage = (error: unknown) => {
  if (error instanceof BaseError) {
    return error.shortMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Transaction failed. Check wallet and contract params.";
};

// to handle cases where the value is not a valid number or is undefined
export const toBigInt = (value?: string) => {
  try {
    return BigInt(value ?? "0");
  } catch {
    return BigInt(0);
  }
};

// get token badge name
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
