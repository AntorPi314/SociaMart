// src/components/sidebar/FloatingMenuAccountButton.jsx
import { useEffect, useState } from "react";
import { User, ShoppingBag, LogOut, Settings } from "lucide-react";
import axios from "axios";
import AuthDialog from "../AuthDialog";

export default function FloatingMenuAccountButton() {
  const [openMenu, setOpenMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

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
        <div className="absolute left-[110%] bottom-0 bg-[#06142E] text-white rounded-md shadow-lg w-40 py-2 z-10">
          <MenuItem icon={<ShoppingBag size={18} />} label="My Orders" />
          <MenuItem icon={<Settings size={18} />} label="Settings" />
          <div onClick={handleLogout}>
            <MenuItem icon={<LogOut size={18} />} label="Logout" />
          </div>
        </div>
      )}

      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

function MenuItem({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 hover:bg-[#1e2e4a] cursor-pointer">
      {icon}
      <span>{label}</span>
    </div>
  );
}
