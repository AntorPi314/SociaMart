import Vector from "../assets/bx_store.svg";
export default function Mart() {
  return (
    <div className="w-[65%] bg-[#06142E] mx-3 px-4 py-4 rounded-[12px]">
      <div className="h-[40%] bg-amber-50">
        <TopHeader />
      </div>
      <div className="h-[60%] bg-[#EDF0F9]"></div>
    </div>
  );
}

function TopHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <img className="w-20" src={Vector} alt="" />

      <h2>Best Buy Store</h2>
      <p className="text-sm text-gray-500">
        25K Followers ·{" "}
        <span className="text-blue-600 font-medium cursor-pointer">Follow</span>
      </p>
    </div>
  );
}
