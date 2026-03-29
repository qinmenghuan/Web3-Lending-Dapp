"use Client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../styles/Home.module.css";
import React from "react";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Header = () => {
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
      <span className="flex-none">
        <ConnectButton />
      </span>
    </div>
  );
};

export default Header;
