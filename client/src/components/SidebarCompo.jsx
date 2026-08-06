import { useState } from "react";
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiMenu } from "react-icons/hi";

export default function SidebarCompo({ isOpen, onToggle }) {
  const [ecomOpen, setEcomOpen] = useState(false);

  return (
    <>
      {/* Burger Button */}
      {/* <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
      >
        <HiMenu className="text-xl" />
      </button> */}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen z-40 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden ${isOpen ? "w-64" : "w-0"}`}>
        
        {/* Logo */}
        <div className="p-4 pt-16 border-b border-gray-200">
          <span className="font-semibold text-gray-800 text-lg">MyApp</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-2 overflow-y-auto">

          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg mx-2">
            <HiChartPie className="text-lg flex-shrink-0" /> Dashboard
          </a>

          {/* E-commerce Collapse */}
          <div className="mx-2">
            <button
              onClick={() => setEcomOpen(!ecomOpen)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg"
            >
              <HiShoppingBag className="text-lg flex-shrink-0" />
              E-commerce
              <span className={`ml-auto transition-transform duration-200 ${ecomOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {ecomOpen && (
              <div className="ml-8 flex flex-col gap-0.5">
                {["Products", "Sales", "Refunds", "Shipping"].map((item) => (
                  <a key={item} href="#" className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg">
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg mx-2">
            <HiInbox className="text-lg flex-shrink-0" /> Inbox
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg mx-2">
            <HiUser className="text-lg flex-shrink-0" /> Users
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg mx-2">
            <HiShoppingBag className="text-lg flex-shrink-0" /> Products
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg mx-2">
            <HiArrowSmRight className="text-lg flex-shrink-0" /> Sign In
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-lg mx-2">
            <HiTable className="text-lg flex-shrink-0" /> Sign Up
          </a>

        </nav>
      </div>
    </>
  );
}