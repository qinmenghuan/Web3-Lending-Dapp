import { BaseError } from "viem";

export const getErrorMessage = (error: unknown) => {
  if (error instanceof BaseError) {
    return error.shortMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Transaction failed. Check wallet and contract params.";
};
