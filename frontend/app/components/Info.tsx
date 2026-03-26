"use client";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

const Info = () => {
  const { address } = useAccount();
  // default eth
  const { data } = useBalance({ address });
  const { data: rccTokenData } = useBalance({
    address,
    token: "0x6FCE5Dd421c88B7df4552E037362Bcea35Ae0AcB",
  });

  return (
    <div>
      <div>address123: {address}</div>
      {data && <div>ETH Balance: {formatUnits(data?.value, 18)}</div>}
      {rccTokenData && (
        <div>Rcc Balance: {formatUnits(rccTokenData?.value, 18)}</div>
      )}
    </div>
  );
};

export default Info;
