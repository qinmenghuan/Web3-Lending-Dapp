import React from "react";
import TitleInfo from "@/components/common/TitleInfo";
import BaseTable from "./components/MarketTable";

const page = () => {
  return (
    <div className="p-8 h-auto">
      <TitleInfo label="Markets" value="Total Active Loans $4,115,057,143" />
      <BaseTable />
    </div>
  );
};

export default page;
