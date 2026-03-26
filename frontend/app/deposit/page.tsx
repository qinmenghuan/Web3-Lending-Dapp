"use client";
import React from "react";
import Header from "@/app/components/Header";
import { useState } from "react";

const page = () => {
  const [amount, setAmount] = useState(0);
  const inputValueHandler = (e) => {
    const value = Number(e.target.value);
    console.log(value);
    setAmount(value);
  };

  const onDeposit = () => {
    console.log("onDeposit");
  };

  return (
    <div className="flex flex-col items-center p-7 rounded-2xl">
      <Header></Header>
      <input type="number" value={amount} onChange={inputValueHandler} />
      <button
        className="bg-blue-500 text-white rounded px-4 py-2"
        onClick={onDeposit}
      >
        deposit
      </button>
    </div>
  );
};

export default page;
