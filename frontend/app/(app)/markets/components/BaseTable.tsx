"use client";
import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMarkets } from "@/lib/market";

const BaseTable = () => {
  const [testData, setTestData] = useState([]);

  React.useEffect(() => {
    // 查询市场
    const fetchMarkets = async () => {
      const markets = await getMarkets();
      console.log("markets", markets);
      setTestData(markets);
    };

    fetchMarkets();
  }, []);

  return (
    <Table className="mt-4">
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Network</TableHead>
          <TableHead>Collateral</TableHead>
          <TableHead>Loan</TableHead>
          <TableHead>LLTV</TableHead>
          <TableHead>Total Market Size</TableHead>
          <TableHead>Total Liquidity</TableHead>
          <TableHead>Utilization</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testData.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.network}</TableCell>
            <TableCell>{item.collateralTokenName}</TableCell>
            <TableCell>{item.loanTokenName}</TableCell>
            {/* 强制执行货款价值比 */}
            <TableCell>{item.lltvDesc}</TableCell>
            <TableCell>{item.totalLoanAmountDesc}</TableCell>
            <TableCell>{item.totalLiquidityDesc}</TableCell>
            <TableCell>{item.utilizationDesc}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BaseTable;
