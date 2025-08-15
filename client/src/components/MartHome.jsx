// src/components/MartHome.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Filter, Search, Plus } from "lucide-react";
import Vector from "../assets/bx_store.svg";
import ProductGlobalHome from "./mart/ProductGlobalHome";
import CrudProductDialog from "./mart/createProductDialog";

export default function Mart() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [products, setProducts] = useState([]);
  const [showCrud, setShowCrud] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://sociamart.onrender.com/home/products", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data.success) {
        const allProducts = res.data.stores.flatMap((store) =>
          (store.products || []).map((product) => ({
            ...product,
            shopName: store.shop?.name,
            shopId: store.shop?._id,
            shopURL: store.shop?.URL,
            shopPIC: store.shop?.profilePIC,
            verified: store.shop?.verified,
          }))
        );
        setProducts(allProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get("https://sociamart.onrender.com/home/search", {
        params: { q: searchTerm },
      });

      if (res.data.success && res.data.results) {
        const allProducts = res.data.results.flatMap((store) =>
          (store.products || []).map((product) => ({
            ...product,
            shopName: store.shop?.name,
            shopId: store.shop?._id,
            shopURL: store.shop?.URL,
            shopPIC: store.shop?.profilePIC,
            verified: store.shop?.verified,
          }))
        );
        setProducts(allProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Search failed", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = [...products].sort((a, b) => {
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
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 px-5 py-2">
        <TopHeader1
          storeInfo={{
            name: "SociaMart",
            profilePIC: null,
            _id: "home",
            verified: true,
          }}
          userId={user?._id}
          setShowCrud={setShowCrud}
        />
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <TopHeader2
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOption={sortOption}
            setSortOption={setSortOption}
            handleSearch={handleSearch}
            userId={user?._id}
            setShowCrud={setShowCrud}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1 bg-[#EDF0F9] rounded-2xl border-8 border-[#EDF0F9]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 font-semibold text-lg">
            Loading products...
          </div>
        ) : filteredProducts.length > 0 ? (
          <MartBody filtered={filteredProducts} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 font-semibold text-lg">
            No products found
          </div>
        )}
      </div>

      {showCrud && (
        <CrudProductDialog
          open={showCrud}
          onClose={() => setShowCrud(false)}
          storeId={"home"}
        />
      )}
    </div>
  );
}

function TopHeader1({ storeInfo, userId, setShowCrud }) {
  const name = storeInfo?.name || "SociaMart";
  const profilePIC = storeInfo?.profilePIC || Vector;

  return (
    <div className="flex items-center gap-0 mb-0 px-0">
      <img
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
          {storeInfo?.verified && (
            <img className="w-5" src="/assets/verified.svg" alt="verified" />
          )}
        </div>
        <p className="text-sm text-gray-500">Your Trusted Partner</p>
      </div>
    </div>
  );
}

function TopHeader2({
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
  handleSearch,
  userId,
  setShowCrud,
  className = "",
}) {
  const isOwner = userId === "home";
  const sortOptions = [
    { label: "Price (High to Low)", value: "price_desc" },
    { label: "Price (Low to High)", value: "price_asc" },
    { label: "Rating (High to Low)", value: "rating_desc" },
    { label: "Rating (Low to High)", value: "rating_asc" },
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
  ];

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 pr-0 bg-white relative ${className}`}
    >
      {isOwner && (
        <button
          onClick={() => setShowCrud(true)}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}
      <div className="flex items-center border border-[#d3d3d3] rounded-full px-4 py-2 bg-white shadow-sm w-72">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search anything..."
          className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
        />
        <button
          onClick={handleSearch}
          className="ml-2 text-blue-600 hover:text-blue-800"
        >
          <Search className="w-5 h-5" />
        </button>
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
    <div className="flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-[1400px] w-full px-14">
        {filtered.map((product) => (
          <ProductGlobalHome
            key={product._id}
            id={product._id}
            name={product.title}
            price={parseFloat(product.price)}
            priceOld={parseFloat(product.price_old)}
            rating={parseFloat(product.rating)}
            left={parseInt(product.left)}
            images={product.images}
            description={product.des}
            wishlist={product.wishlist}
            storeId={product.shopId}
            productId={product._id}
            shopName={product.shopName}
            shopPIC={product.shopPIC}
            verified={product.verified}
            shopURL={product.shopURL}
          />
        ))}
      </div>
    </div>
  );
}
