// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { House, ArrowLeftRight, Store, Heart, ShoppingCart } from "lucide-react";
import FloatingMenuAccountButton from "./sidebar/FloatingMenuAccountButton";
import ShowWishlistDialog from "./mart/showWishlistDialog";
import ShowCartDialog from "./mart/showCartDialog";
import ShowFollowedShop from "./sidebar/showFollowedShop"; // ✅

export default function Sidebar() {
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [followedShopOpen, setFollowedShopOpen] = useState(false); // ✅

  useEffect(() => {
    const followedShopBtn = document.getElementById("my-followed-shop");
    if (followedShopBtn) {
      followedShopBtn.onclick = () => {
        console.log("[Sidebar] Followed Shop icon clicked");
        setFollowedShopOpen(true);
      };
    }
  }, []);

  return (
    <div className="w-16 flex flex-col justify-between bg-[#06142E] py-4 rounded-[12px]">
      <div>
        <BarButton1 />
        <BarButton2 />
        <BarButton3 />
      </div>
      <div>
        <BarButton4 onClick={() => setWishlistOpen(true)} />
        <BarButton5 onClick={() => setCartOpen(true)} />
        <FloatingMenuAccountButton />
      </div>

      {/* Dialogs */}
      <ShowWishlistDialog open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <ShowCartDialog open={cartOpen} onClose={() => setCartOpen(false)} />
      <ShowFollowedShop open={followedShopOpen} onClose={() => setFollowedShopOpen(false)} /> {/* ✅ */}
    </div>
  );
}

function BarButton1() {
  return (
    <div id="home" className="relative w-auto h-12 flex items-center justify-center cursor-pointer">
      <House color="white" />
    </div>
  );
}

function BarButton2() {
  return (
    <div id="hide-show-Socia" className="relative w-auto h-12 flex items-center justify-center cursor-pointer">
      <ArrowLeftRight color="white" />
    </div>
  );
}

function BarButton3() {
  return (
    <div id="my-followed-shop" className="relative w-auto h-12 flex items-center justify-center cursor-pointer">
      <Store color="white" />
    </div>
  );
}

function BarButton4({ onClick }) {
  return (
    <div
      id="my-wishlist"
      className="relative w-auto h-12 flex items-center justify-center cursor-pointer"
      onClick={onClick}
    >
      <Heart color="white" />
    </div>
  );
}

function BarButton5({ onClick }) {
  return (
    <div
      id="my-cart"
      className="relative w-auto h-12 mb-4 flex items-center justify-center cursor-pointer"
      onClick={onClick}
    >
      <ShoppingCart color="white" />
    </div>
  );
}
