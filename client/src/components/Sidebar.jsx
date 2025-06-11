import { useState } from "react";
import { User, ShoppingBag, LogOut } from "lucide-react";
import Vector from "../assets/bx_store.svg";

export default function Root() {
  return (
    <div className="w-20 flex flex-col justify-between bg-[#06142E] py-4 rounded-[12px]">
      <div>
        <BarButton1 />
        <BarButton1 />
      </div>
      <div>
        <FloatingMenuButton />
      </div>
    </div>
  );
}

function BarButton1() {
  return (
    <div className="relative w-auto h-12 flex items-center justify-center bg-[#1d5dd3] rounded-xl cursor-pointer">
      <img className="w-10" src={Vector} alt="" />
      <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        11
      </div>
    </div>
  );
}

function FloatingMenuButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-[100%] h-12 flex items-center justify-center bg-[#19376d]"
      >
        <User className="text-white" />
      </button>
      {open && (
        <div className="absolute left-[110%] bottom-0 bg-[#06142E] text-white rounded-md shadow-lg w-40 py-2 z-10">
          <MenuItem icon={<User size={18} />} label="Profile" />
          <MenuItem icon={<ShoppingBag size={18} />} label="My Orders" />
          <MenuItem icon={<LogOut size={18} />} label="Logout" />
        </div>
      )}
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
