import React from "react";

export default function Home() {
  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <div className="w-16 bg-[#06142E] flex flex-col items-center py-4 gap-4 rounded-r-2xl">
        <SidebarIcon svg="🏠" />
        <SidebarIcon svg="🔔" badge="11" />
        <SidebarIcon svg="🔔" badge="11" />
        <SidebarIcon svg="🛍️" badge="25" active />
        <SidebarIcon svg="❤️" badge="11" />
        <SidebarIcon svg="🛒" badge="5" />
        <SidebarIcon svg="👤" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Store Info */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <div>
              <h1 className="font-bold text-lg text-gray-700">
                Best Buy Store <span className="text-blue-500">✔</span>
              </h1>
              <p className="text-sm text-gray-500">
                25K Followers ·{" "}
                <span className="text-blue-600 font-medium cursor-pointer">
                  Follow
                </span>
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-6">
            <div className="flex items-center border rounded-xl px-4 py-2 bg-white shadow-sm">
              <span className="mr-2 text-pink-400">🔍</span>
              <input
                type="text"
                placeholder="Search in Store"
                className="flex-1 outline-none text-sm text-gray-600"
              />
            </div>
          </div>

          {/* Menu & Mind */}
          <div className="flex items-center gap-4">
            <div className="border rounded-xl px-4 py-2 bg-white shadow-sm text-xl">
              ☰⬆️
            </div>
            <div className="flex items-center border rounded-xl px-4 py-2 bg-white shadow-sm text-sm text-gray-400">
              <span className="mr-2">👤</span> Whats on your mind?
            </div>
          </div>
        </div>

        {/* Body Divs */}
        <div className="flex gap-4 h-full overflow-hidden">
          <div className="flex-1 bg-[#BEC2D1] rounded-xl flex items-center justify-center text-5xl font-bold">
            div
          </div>
          <div className="w-[30%] bg-[#1543D0] rounded-xl flex items-center justify-center text-5xl font-bold text-black">
            div
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarIcon({ svg, badge, active }) {
  return (
    <div className={`relative ${active ? "bg-purple-500 rounded-xl p-2" : ""}`}>
      <span className="text-white text-2xl">{svg}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-[1px] rounded-full font-bold">
          {badge}
        </span>
      )}
    </div>
  );
}