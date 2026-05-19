import React from "react";
import TitleInfo from "../components/TitleInfo";
import BaseTable from "./components/BaseTable";

const page = () => {
  return (
    <div className="p-8 h-auto">
      <TitleInfo label="Markets" value="Total Active Loans $4,115,057,143" />
      <BaseTable />
    </div>
  );
};

export default page;
