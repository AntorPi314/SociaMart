import { useState } from "react";
import { House, ArrowLeftRight, Store, Heart, ShoppingCart } from "lucide-react";
import FloatingMenuAccountButton from "./sidebar/FloatingMenuAccountButton";
import ShowWishlistDialog from "./mart/showWishlistDialog";
import ShowCartDialog from "./mart/showCartDialog"; // ✅ NEW

export default function Sidebar() {
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false); // ✅ NEW

  const handleOpenWishlist = () => {
    console.log("[Sidebar] Opening wishlist dialog...");
    setWishlistOpen(true);
  };

  const handleCloseWishlist = () => {
    console.log("[Sidebar] Closing wishlist dialog...");
    setWishlistOpen(false);
  };

  const handleOpenCart = () => {
    console.log("[Sidebar] Opening cart dialog...");
    setCartOpen(true);
  };

  const handleCloseCart = () => {
    console.log("[Sidebar] Closing cart dialog...");
    setCartOpen(false);
  };

  return (
    <div className="w-16 flex flex-col justify-between bg-[#06142E] py-4 rounded-[12px]">
      <div>
        <BarButton1 />
        <BarButton2 />
        <BarButton3 />
      </div>
      <div>
        <BarButton4 onClick={handleOpenWishlist} />
        <BarButton5 onClick={handleOpenCart} /> {/* ✅ pass open handler */}
        <FloatingMenuAccountButton />
      </div>

      {/* Dialogs */}
      <ShowWishlistDialog open={wishlistOpen} onClose={handleCloseWishlist} />
      <ShowCartDialog open={cartOpen} onClose={handleCloseCart} /> {/* ✅ NEW */}
    </div>
  );
}

function BarButton1() {
  return (
    <div
      id="home"
      className="relative w-auto h-12 flex items-center justify-center cursor-pointer"
    >
      <House color="white" />
    </div>
  );
}

function BarButton2() {
  return (
    <div
      id="hide-show-Socia"
      className="relative w-auto h-12 flex items-center justify-center cursor-pointer"
    >
      <ArrowLeftRight color="white" />
    </div>
  );
}

function BarButton3() {
  return (
    <div
      id="my-shop"
      className="relative w-auto h-12 flex items-center justify-center cursor-pointer"
    >
      <Store color="white" />
    </div>
  );
}

function BarButton4({ onClick }) {
  return (
    <div
      id="my-wishlist"
      className="relative w-auto h-12 flex items-center justify-center cursor-pointer"
      onClick={() => {
        console.log("[Sidebar] Wishlist icon clicked");
        try {
          onClick();
        } catch (err) {
          console.error("[Sidebar] Failed to open wishlist dialog", err);
        }
      }}
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
      onClick={() => {
        console.log("[Sidebar] Cart icon clicked");
        try {
          onClick();
        } catch (err) {
          console.error("[Sidebar] Failed to open cart dialog", err);
        }
      }}
    >
      <ShoppingCart color="white" />
    </div>
  );
}
