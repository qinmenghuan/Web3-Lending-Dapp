import { title } from "process";
import React from "react";

const TitleInfo = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex justify-between">
      <span className="text-4xl">{label}</span>
      <span className="rounded-xl bg-gray-200 flex items-center px-3">
        {value}
      </span>
    </div>
  );
};

export default TitleInfo;
