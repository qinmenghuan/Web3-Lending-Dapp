"use Client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../styles/Home.module.css";
import Info from "../components/Info";

import React from "react";

const Header = () => {
  return (
    <div className={styles.header}>
      {/* <div>Dapp dashboard</div> */}
      <ConnectButton />
    </div>
  );
};

export default Header;
