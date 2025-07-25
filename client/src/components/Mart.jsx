// src/components/Mart.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Filter, Search, Plus } from "lucide-react";
import Vector from "../assets/bx_store.svg";
import ProductGlobal from "./mart/ProductGlobal";
import CrudProductDialog from "./mart/createProductDialog";

export default function Mart({ storeName }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [storeInfo, setStoreInfo] = useState(undefined);
  const [products, setProducts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const [showCrud, setShowCrud] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    async function fetchStoreProducts() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(
          `http://localhost:3000/products/${storeName}`,
          { headers }
        );
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
    <div className="flex flex-col flex-1 ml-1.5 rounded-[12px] overflow-hidden bg-white">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-0 py-3 bg-white">
        {storeInfo !== null && (
          <>
            <TopHeader1
              storeInfo={storeInfo}
              isFollowing={isFollowing}
              onFollowClick={handleFollowToggle}
              isLoggedIn={isLoggedIn}
              setShowCrud={setShowCrud}
            />

            {/* Center TopHeader2 on mobile, right-align on desktop */}
            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <TopHeader2
                storeInfo={storeInfo}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOption={sortOption}
                setSortOption={setSortOption}
                setShowCrud={setShowCrud}
              />
            </div>
          </>
        )}

        {storeInfo === null && (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 text-red-600 font-semibold">
            <img src="/assets/error.svg" alt="Error Icon" className="w-8 h-8" />
            <span className="text-lg font-bold">
              Shop '{storeName}' not found
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-1 bg-[#EDF0F9] rounded-2xl border-8 border-[#EDF0F9]">
        {storeInfo === null ? null : filtered.length > 0 ? (
          <MartBody filtered={filtered} storeId={storeInfo?._id} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 font-semibold text-lg">
            No products found in this store.
          </div>
        )}
      </div>
      {showCrud && (
        <CrudProductDialog
          open={showCrud}
          onClose={() => setShowCrud(false)}
          storeId={storeInfo?._id}
        />
      )}
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

function TopHeader1({
  storeInfo,
  isFollowing,
  onFollowClick,
  isLoggedIn,
  setShowCrud,
}) {
  const name = storeInfo?.name || "Best Buy Store";
  const profilePIC = storeInfo?.profilePIC || Vector;
  const followers = storeInfo?.followers || 0;
  const isVerified = storeInfo?.verified || false;
  const userId = JSON.parse(localStorage.getItem("user"))?._id;

  console.log("User ID:", userId);
  console.log("Store ID:", storeInfo?._id);
  console.log("Match:", userId === storeInfo?._id);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-0 px-4">
      <div className="flex items-center gap-3">
        <img
          id="profilePic_img"
          className="w-14 h-14 rounded-full cursor-pointer"
          src={profilePIC}
          onClick={() => {
            if (userId === storeInfo?._id) setShowCrud(true);
          }}
          alt="Store"
        />
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
    </div>
  );
}

function TopHeader2({
  storeInfo,
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
  setShowCrud,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const isOwner = userId === storeInfo?._id;

  const sortOptions = [
    { label: "Price (High to Low)", value: "price_desc" },
    { label: "Price (Low to High)", value: "price_asc" },
    { label: "Rating (High to Low)", value: "rating_desc" },
    { label: "Rating (Low to High)", value: "rating_asc" },
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
  ];

  return (
    <div className="flex flex-row items-center justify-end gap-2 sm:gap-4 pr-4 bg-white">
      {isOwner && (
        <button
          onClick={() => setShowCrud(true)}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}

      <div
        id="searchBox"
        className="relative flex items-center border border-[#E3E3E3] rounded-[16px] px-4 py-2 bg-white shadow-sm w-72"
      >
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
          className="flex items-center justify-center gap-1 border border-gray-300 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
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



function MartBody({ filtered, storeId }) {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-screen-xl w-full">
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
            wishlist={product.wishlist}
            storeId={storeId}
            productId={product._id}
          />
        ))}
      </div>
    </div>
  );
}

