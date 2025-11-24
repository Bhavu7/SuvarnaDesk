import React from "react";
import { MdMenu, MdPerson } from "react-icons/md";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => (
  <div className="flex items-center justify-between px-4 bg-white border-b shadow-sm md:hidden h-14">
    <button
      type="button"
      onClick={onMenuClick}
      className="mr-2 text-3xl text-blue-600"
      title="Open menu"
    >
      <MdMenu />
    </button>
    <span className="text-lg font-bold text-blue-700">SuvarnaDesk</span>
    <span className="flex items-center gap-1 text-gray-700">
      <MdPerson className="text-lg" /> Admin
    </span>
  </div>
);

export default Topbar;
