// src/components/Mart.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Filter, Search } from "lucide-react";
import Vector from "../assets/bx_store.svg";
import ProductGlobal from "./mart/ProductGlobal";

export default function Mart({ storeName }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [storeInfo, setStoreInfo] = useState(undefined);
  const [products, setProducts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    async function fetchStoreProducts() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`http://localhost:3000/products/${storeName}`, { headers });
        if (res.data.success) {
          setStoreInfo(res.data.user);
          setProducts(res.data.products || []);
          setIsFollowing(res.data.isFollowing || false);
        } else {
          setStoreInfo(null);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching store data:", error);
        setStoreInfo(null);
        setProducts([]);
      }
    }

    if (storeName) fetchStoreProducts();
  }, [storeName]);

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !storeInfo?._id) return;

      const endpoint = isFollowing
        ? `http://localhost:3000/stores/unfollow/${storeInfo._id}`
        : `http://localhost:3000/stores/follow/${storeInfo._id}`;

      const res = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setIsFollowing((prevFollowing) => {
          setStoreInfo((prevStoreInfo) => ({
            ...prevStoreInfo,
            followers: prevStoreInfo.followers + (prevFollowing ? -1 : 1),
          }));
          return !prevFollowing;
        });
      }
    } catch (error) {
      console.error("Follow toggle failed:", error);
    }
  };

  const filtered = products
    .filter((p) => p.title?.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="flex flex-col flex-1 mx-3 rounded-[12px] overflow-hidden bg-white">
      <div className="h-[80px] flex justify-between items-center px-4">
        {/* Hide TopHeader1 if store not found */}
        {storeInfo !== null && (
          <TopHeader1
            storeInfo={storeInfo}
            isFollowing={isFollowing}
            onFollowClick={handleFollowToggle}
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* TopHeader2: either search/sort or error message */}
        {storeInfo !== null ? (
          <TopHeader2
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 text-red-600 font-semibold">
            <img
              src="/assets/error.svg"
              alt="Error Icon"
              className="w-8 h-8"
            />
            <span className="text-lg font-bold">
              Shop '{storeName}' not found
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-1 bg-[#EDF0F9] rounded-2xl border-8 border-[#EDF0F9]">
        {storeInfo === null ? null : filtered.length > 0 ? (
          <MartBody filtered={filtered} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 font-semibold text-lg">
            No products found in this store.
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format followers count
function formatFollowers(num) {
  if (num < 1000) return num.toString();
  if (num >= 1000 && num < 1_000_000)
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K";
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M";
  return num.toString();
}

function TopHeader1({ storeInfo, isFollowing, onFollowClick, isLoggedIn }) {
  const name = storeInfo?.name || "Best Buy Store";
  const profilePIC = storeInfo?.profilePIC || Vector;
  const followers = storeInfo?.followers || 0;
  const isVerified = storeInfo?.verified || false;

  return (
    <div className="flex items-center gap-4 mb-4 px-4">
      <img className="w-14 h-14 rounded-full" src={profilePIC} alt="Store" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-semibold">{name}</h2>
          {isVerified && (
            <img className="w-5" src="/assets/verified.svg" alt="verified" />
          )}
        </div>
        <p className="text-sm text-gray-500">
          {formatFollowers(followers)} Followers{" "}
          {isLoggedIn && (
            <>
              ·{" "}
              <span
                onClick={onFollowClick}
                className="text-blue-600 font-medium cursor-pointer"
              >
                {isFollowing ? "Following" : "Follow"}
              </span>
            </>
          )}
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

function MartBody({ filtered }) {
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
