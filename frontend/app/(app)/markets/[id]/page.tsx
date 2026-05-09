import React from "react";
import DetailBaseInfo from "../components/DetailBaseInfo";
import Lend from "../components/Lend";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  // 获取动态路由参数（[id]）
  const resolvedParams = await params;
  const marketId = resolvedParams.id;

  console.log("Market ID:", marketId);

  return (
    <div className="py-16 px-24 flex flex-row gap-16">
      {/* 将 marketId 传递给子组件 */}
      <DetailBaseInfo marketId={marketId} className="flex-1" />
      <Lend marketId={marketId} className="flex-none" />
    </div>
  );
};

export default page;
