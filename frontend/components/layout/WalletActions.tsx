"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";

import { Button } from "@/components/ui/button";
import { requestWalletLogin, verifyWalletLogin } from "@/lib/api/auth";

type WalletActionsProps = {
  className?: string;
  showSignIn?: boolean;
};

export default function WalletActions({
  className,
  showSignIn = true,
}: WalletActionsProps) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);

  const handleWalletLogin = async () => {
    if (!address) return;

    try {
      setIsLoading(true);

      const challenge = await requestWalletLogin(address);
      const signature = await signMessageAsync({
        message: challenge.message,
      });
      const result = await verifyWalletLogin({
        walletAddress: address,
        message: challenge.message,
        signature,
      });

      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(result.user));
    } catch (error) {
      console.error(error);
      alert("Wallet login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      {isConnected && showSignIn ? (
        <Button
          onClick={handleWalletLogin}
          disabled={isLoading}
          variant="outline"
          className="border-white/20 bg-white/6 text-[0.82rem] text-white backdrop-blur hover:bg-white/12"
        >
          {isLoading ? "Signing..." : "Sign in"}
        </Button>
      ) : null}
      <ConnectButton />
    </div>
  );
}
