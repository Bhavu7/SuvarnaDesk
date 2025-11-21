import React from "react";

interface TopbarProps {
  shopName: string;
  adminName: string;
  onLogout: () => void;
}

export default function Topbar({ shopName, adminName, onLogout }: TopbarProps) {
  return (
    <header className="flex items-center justify-between bg-gray-50 px-6 py-3 border-b">
      <h1 className="text-xl font-bold">{shopName || "SuvarnaDesk"}</h1>
      <div className="flex items-center space-x-4">
        <span>{adminName}</span>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
