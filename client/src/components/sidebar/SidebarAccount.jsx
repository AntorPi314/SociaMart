import { User, ShoppingBag, LogOut } from "lucide-react";

export default function SidebarMenu() {
  return (
    <div className="relative">
      {/* Your sidebar button (e.g. profile icon) */}
      <button className="w-12 h-12 flex items-center justify-center bg-[#06142E] rounded-full">
        <User className="text-white" />
      </button>

      {/* Floating Menu */}
      <div className="absolute left-16 bottom-10 bg-[#06142E] text-white rounded-md shadow-lg w-40 py-2 z-10">
        <MenuItem icon={<User size={18} />} label="Profile" />
        <MenuItem icon={<ShoppingBag size={18} />} label="My Orders" />
        <MenuItem icon={<LogOut size={18} />} label="Logout" />
      </div>
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
