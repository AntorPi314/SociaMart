// src/components/sidebar/FloatingMenuAccountButton.jsx
import { useEffect, useState } from "react";
import { User, ShoppingBag, LogOut, Settings } from "lucide-react";
import axios from "axios";
import AuthDialog from "../AuthDialog";
import EditSettings from "../sidebar/editSettings";
import MyOrderDialog from "../mart/myOrderDialog"; // ✅ Import
import ManageOrder from "../mart/manageOrder"; // ✅ Import

export default function FloatingMenuAccountButton() {
  const [openMenu, setOpenMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false); // ✅ For customers
  const [showManageOrders, setShowManageOrders] = useState(false); // ✅ For shop owners

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get("https://sociamart.onrender.com/profile/pic", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success && res.data.profilePIC) {
            setProfilePic(res.data.profilePIC);
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch {
                setUser(null);
              }
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching profile pic:", err);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (!user) {
            setShowAuth(true);
          } else {
            setOpenMenu(!openMenu);
          }
        }}
        className="w-full h-12 flex items-center justify-center rounded-full overflow-hidden"
      >
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <User className="text-white w-6 h-6" />
        )}
      </button>

      {openMenu && (
        <div
          id="myOrdersOption"
          className="absolute left-[110%] bottom-0 bg-[#06142E] text-white rounded-md shadow-lg w-40 py-2 z-10"
        >
          {user?.isShop ? (
            <MenuItem
              icon={<ShoppingBag size={18} />}
              label="Manage Orders"
              onClick={() => {
                setShowManageOrders(true);
                setOpenMenu(false);
              }}
            />
          ) : (
            <MenuItem
              icon={<ShoppingBag size={18} />}
              label="My Orders"
              onClick={() => {
                setShowMyOrders(true);
                setOpenMenu(false);
              }}
            />
          )}

          <MenuItem
            id="settings"
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => {
              setShowSettings(true);
              setOpenMenu(false);
            }}
          />
          <div onClick={handleLogout}>
            <MenuItem icon={<LogOut size={18} />} label="Logout" />
          </div>
        </div>
      )}

      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} />

      {showSettings && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <EditSettings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      {showMyOrders && (
        <MyOrderDialog open={showMyOrders} onClose={() => setShowMyOrders(false)} />
      )}

      {showManageOrders && user && (
        <ManageOrder open={showManageOrders} onClose={() => setShowManageOrders(false)} shopId={user._id} />
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 hover:bg-[#1e2e4a] cursor-pointer"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
