import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
