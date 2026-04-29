"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/utils";
import { getMarketById } from "@/lib/market";

const DetailBaseInfo = ({ marketId }: { marketId: string }) => {
  const [market, setMarket] = React.useState(null);

  useEffect(() => {
    const fetchMarket = async () => {
      const market = await getMarketById(Number(marketId));
      console.log("market", market);
      setMarket(market);
    };

    fetchMarket();
  }, [marketId]);

  if (!market) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h2>
        <div className="flex items-center gap-4">
          <span className="text-5xl">
            {market?.collateralTokenName}/{market?.loanTokenName}
          </span>
          <span className="rounded-lg bg-gray-200 text-black p-1 py-1 text-xs">
            {market?.lltvDesc}
          </span>
        </div>
        <div className="mt-4 mb-10">
          <Button variant="soft">
            {formatAddress(market?.collateralTokenAddress)}
          </Button>
          <Button variant="soft">{market.network}</Button>
        </div>
      </h2>
      <div className="flex justify-between">
        <span className="flex flex-col">
          <span>Total Market Size</span>
          <span className="text-4xl mt-4">$1.29B</span>
        </span>
        <span className="flex flex-col">
          <span>Total Liquidity</span>
          <span className="text-4xl mt-4">$1.29B</span>
        </span>
        <span className="flex flex-col">
          <span>Rate</span>
          <span className="text-4xl mt-4">86%</span>
        </span>
        <span className="flex flex-col">
          <span>Trust By</span>
          <span className="text-4xl mt-4">1,234 Users</span>
        </span>
      </div>
    </div>
  );
};

export default DetailBaseInfo;
