// src/components/Sidebar.jsx
import { useNavigate, useLocation  } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  House,
  ArrowLeftRight,
  Store,
  Heart,
  ShoppingCart,
} from "lucide-react";
import FloatingMenuAccountButton from "./sidebar/FloatingMenuAccountButton";
import ShowWishlistDialog from "./mart/showWishlistDialog";
import ShowCartDialog from "./mart/showCartDialog";
import ShowFollowedShop from "./sidebar/showFollowedShop";
import Toast from "./Toast";

export default function Sidebar() {
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [followedShopOpen, setFollowedShopOpen] = useState(false);
  const [isShop, setIsShop] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsShop(user.isShop === true);
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }

    // Attach click handler for followed shop
    const followedShopBtn = document.getElementById("my-followed-shop");
    if (followedShopBtn) {
      followedShopBtn.onclick = () => {
        const user = localStorage.getItem("user");
        if (!user) {
          setToast({ message: "Please login first", type: "error" });
          return;
        }
        setFollowedShopOpen(true);
      };
    }

    // Toggle sidebar (mobile)
    const toggleBtn = document.getElementById("hide-show");
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const event = new Event("toggle-socia");
        window.dispatchEvent(event);
      };
    }
  }, []);

  const handleWishlistClick = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setToast({ message: "Please login first", type: "error" });
      return;
    }
    setWishlistOpen(true);
  };

  const handleCartClick = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setToast({ message: "Please login first", type: "error" });
      return;
    }
    setCartOpen(true);
  };

  return (
    <>
      <div className="w-16 flex flex-col justify-between bg-[#06142E] py-4 rounded-[12px]">
        <div>
          <BarButton1 />
          <BarButton2 />
          <BarButton3 />
        </div>
        <div>
          <BarButton4 onClick={handleWishlistClick} />
          {!isShop && <BarButton5 onClick={handleCartClick} />}
          <FloatingMenuAccountButton />
        </div>

        <ShowWishlistDialog
          open={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
        />
        <ShowCartDialog open={cartOpen} onClose={() => setCartOpen(false)} />
        <ShowFollowedShop
          open={followedShopOpen}
          onClose={() => setFollowedShopOpen(false)}
        />
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

function BarButton1() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = () => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };
  return (
    <div
      id="home"
      className="relative w-auto h-12 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      <House color="white" />
    </div>
  );
}

function BarButton2() {
  return (
    <div
      id="hide-show"
      className="relative w-auto h-12 flex items-center justify-center cursor-pointer block md:hidden"
    >
      <ArrowLeftRight color="white" />
    </div>
  );
}

function BarButton3() {
  return (
    <div
      id="my-followed-shop"
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
