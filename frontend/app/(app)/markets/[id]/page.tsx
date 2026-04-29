import React from "react";
import DetailBaseInfo from "../components/DetailBaseInfo";

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
    <div className="py-16 px-24">
      {/* 将 marketId 传递给子组件 */}
      <DetailBaseInfo marketId={marketId} />
    </div>
  );
};

export default page;
