import { useEffect, useState } from "react";
import { User, ShoppingBag, LogOut, Settings } from "lucide-react";
import Vector from "../assets/bx_store.svg";
import AuthDialog from "./AuthDialog";
import axios from "axios";

export default function Root() {
  return (
    <div className="w-20 flex flex-col justify-between bg-[#06142E] py-4 rounded-[12px]">
      <div>
        <BarButton1 />
        <BarButton1 />
        <BarButton1 />
      </div>
      <div>
        <FloatingMenuAccountButton />
      </div>
    </div>
  );
}

function BarButton1() {
  return (
    <div className="relative w-auto h-12 flex items-center justify-center bg-[#1d5dd3] rounded-xl cursor-pointer">
      <img className="w-10" src={Vector} alt="Store Icon" />
      <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        11
      </div>
    </div>
  );
}

function FloatingMenuAccountButton() {
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
            setShowAuth(true); // open directly if not logged in
          } else {
            setOpenMenu(!openMenu);
          }
        }}
        className={`w-full h-12 flex items-center justify-center rounded-full overflow-hidden ${
          !profilePic ? "" : ""
        }`}
      >
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <User id="userIcon" className="text-white w-6 h-6" />
        )}
      </button>

      {openMenu && (
        <div className="absolute left-[110%] bottom-0 bg-[#06142E] text-white rounded-md shadow-lg w-40 py-2 z-10">
          <div>
            <MenuItem icon={<ShoppingBag size={18} />} label="My Orders" />
          </div>
          <div>
            <MenuItem icon={<Settings size={18} />} label="Settings" />
          </div>
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
