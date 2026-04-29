import React from "react";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/utils";

const DetailBaseInfo = () => {
  return (
    <div>
      <h2>
        <div className="flex items-center gap-4">
          <span className="text-6xl">cbBTC/USDC</span>
          <span className="rounded-lg bg-gray-200 text-black p-1 py-1 text-xs">
            86%
          </span>
        </div>
        <div className="mt-4 mb-10">
          <Button variant="soft">
            {formatAddress(
              "0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836",
            )}
          </Button>
          <Button variant="soft">Base</Button>
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
