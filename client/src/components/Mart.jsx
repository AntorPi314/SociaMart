import React, { useEffect, useState } from "react";
import axios from "axios";
import Vector from "../assets/bx_store.svg";
import ProductGlobal from "./mart/ProductGlobal";
import { Filter, Search } from "lucide-react";

export default function Mart() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");

  return (
    <div className="flex flex-col flex-1 mx-3 rounded-[12px] overflow-hidden bg-white">
      <div className="h-[80px] flex justify-between">
        <TopHeader1 />
        <TopHeader2
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
      </div>

      <div className="flex-1 items-center justify-center overflow-y-auto p-1 bg-[#EDF0F9] rounded-2xl border-8 border-[#EDF0F9]">
        <MartBody searchTerm={searchTerm} sortOption={sortOption} />
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

function TopHeader2({ searchTerm, setSearchTerm, sortOption, setSortOption }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const sortOptions = [
    { label: "Price (High to Low)", value: "price_desc" },
    { label: "Price (Low to High)", value: "price_asc" },
    { label: "Rating (High to Low)", value: "rating_desc" },
    { label: "Rating (Low to High)", value: "rating_asc" },
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
  ];

  return (
    <div className="flex items-center gap-4 pr-4 bg-white relative">
      {/* Updated Search Input to Match Image */}
      <div className="relative flex items-center border border-[#E3E3E3] rounded-[16px] px-4 py-2 w-60 sm:w-72 md:w-80 lg:w-96 bg-white shadow-sm">
        <Search className="w-5 h-5 text-[#C9A9A6]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search in Store"
          className="ml-2 bg-transparent text-[#C9A9A6] placeholder-[#C9A9A6] text-sm w-full outline-none"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1 border border-gray-300 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <Filter className="w-4 h-4 text-gray-600" />
          <span>Sort</span>
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  sortOption === option.value ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => {
                  setSortOption(option.value);
                  setShowDropdown(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MartBody({ searchTerm, sortOption }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  const filtered = products
    .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortOption) {
        case "price_desc":
          return b.price - a.price;
        case "price_asc":
          return a.price - b.price;
        case "rating_desc":
          return b.rating - a.rating;
        case "rating_asc":
          return a.rating - b.rating;
        case "name_asc":
          return a.title.localeCompare(b.title);
        case "name_desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {filtered.map((product) => (
        <ProductGlobal
          key={product._id}
          id={product._id}
          name={product.title}
          price={parseFloat(product.price)}
          priceOld={parseFloat(product.price_old)}
          rating={parseFloat(product.rating)}
          left={parseInt(product.left)}
          images={product.images}
          description={product.des}
          hideShop={true}
        />
      ))}
    </div>
  );
}
