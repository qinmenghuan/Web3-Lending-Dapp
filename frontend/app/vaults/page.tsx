import React from "react";
import TitleInfo from "@/components/common/TitleInfo";
import BaseTable from "./components/VaultTable";

const page = () => {
  return (
    <div className="p-8 h-auto">
      <TitleInfo label="Vaults" value="Total Value Locked $1,234,567,890" />
      <BaseTable />
    </div>
  );
};

export default page;
