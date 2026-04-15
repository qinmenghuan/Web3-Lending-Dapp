"use client";
import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { requestWalletLogin, verifyWalletLogin } from "@/lib/auth";
import styles from "../styles/Home.module.css";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { sign } from "crypto";

const Header = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [Loading, setLoading] = useState(false);

  // 处理登录请求
  const handleWalletLogin = async () => {
    console.log("handleWalletLogin");
    if (!address) return;

    try {
      setLoading(true);

      // 获取登录信息
      const challenge = await requestWalletLogin(address);
      // 签名
      const signature = await signMessageAsync({
        message: challenge.message,
      });
      // 登录验证
      const result = await verifyWalletLogin({
        walletAddress: address,
        message: challenge.message,
        signature,
      });

      // 本地存储
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(result?.user));
    } catch (error) {
      console.log(error);
      alert("Wallet login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center mx-8 my-4">
      <h1 className="text-2xl font-bold flex-none mr-8">Huan Morpho</h1>
      <span className="grow">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={`${navigationMenuTriggerStyle()} text-lg`}
              >
                <Link href="/vaults">Vaults</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={`${navigationMenuTriggerStyle()} text-lg`}
              >
                <Link href="/markets">Markets</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </span>
      <span className="flex items-center gap-3">
        {isConnected && (
          <button
            onClick={handleWalletLogin}
            disabled={Loading}
            className="px-4 py-2 rounded border"
          >
            {Loading ? "Signing ..." : "Sign in"}
          </button>
        )}
        <ConnectButton />
      </span>
    </div>
  );
};

export default Header;
