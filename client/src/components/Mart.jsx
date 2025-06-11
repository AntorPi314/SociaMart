import Vector from "../assets/bx_store.svg";
// import Vector_verified from "../assets/verified.svg";
import SidebarAccount from "./sidebar/SidebarAccount";
// import { useState } from "react";
import ProductGlobal from "./mart/ProductGlobal";

export default function Mart() {
  return (
    <div className="flex flex-col flex-1 mx-3 rounded-[12px] overflow-hidden bg-white">
      <div className="h-[80px] flex justify-between">
        <TopHeader1 />
        <TopHeader2 />
      </div>

      <div className="flex-1 items-center justify-center overflow-y-auto p-1 bg-[#EDF0F9] rounded-2xl border-8 border-[#EDF0F9]">
        <MartBody />
      </div>
    </div>
  );
}

function TopHeader1() {
  return (
    <div className="flex items-center justify-center mb-4">
      <img className="w-15" src={Vector} alt="" />
      <div className="flex-col">
        <div className="flex">
          <h2>Best Buy Store</h2>
          <img className="w-5" src={"/assets/verified.svg"} alt="" />
        </div>

        <p className="text-sm text-gray-500">
          25K Followers ·{" "}
          <span className="text-blue-600 font-medium cursor-pointer">
            Follow
          </span>
        </p>
      </div>
    </div>
  );
}

function TopHeader2() {
  return (
    <div className=" flex items-center justify-center bg-white ">
      <div className="flex bg-yellow-50 rounded-2xl border-2 border-amber-600">
        <img className="w-5" src={Vector} alt="" />
        <input
          type="text"
          placeholder="Search in Store"
          className="bg-amber-50 p-3 rounded-3xl outline-none"
        />
      </div>

      <img className="w-5" src={Vector} alt="" />
    </div>
  );
}

function MartBody() {
  return (
    <div className="flex-1  rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
      <ProductGlobal />
    </div>
  );
}
