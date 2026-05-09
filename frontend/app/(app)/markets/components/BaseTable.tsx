"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMarkets } from "@/lib/market";

interface MarketRow {
  id: number;
  network: string;
  collateralTokenName: string;
  loanTokenName: string;
  lltvDesc: string;
  totalLoanAmountDesc: string;
  totalLiquidityDesc?: string;
  utilizationDesc?: string;
}

const BaseTable = () => {
  const [testData, setTestData] = useState<MarketRow[]>([]);
  const router = useRouter();

  useEffect(() => {
    // 查询市场
    const fetchMarkets = async () => {
      const markets = await getMarkets();
      console.log("markets", markets);
      setTestData(markets);
    };

    fetchMarkets();
  }, []);

  const onRowClick = (item: MarketRow) => {
    console.log("Clicked market:", item);
    router.push(`/markets/${item.id}`);
  };

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
          <TableRow key={item.id} onClick={() => onRowClick(item)}>
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
