import React from "react";
import { FaHome, FaBell, FaInbox, FaEllipsisH } from "react-icons/fa";
import "../styles/Sidebar.css";

const SideBar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <img src="/avatar.png" alt="User Avatar" className="avatar" />
      </div>
      <nav className="sidebar-nav">
        <button className="nav-item active">
          <FaHome />
        </button>
        <button className="nav-item">
          <FaInbox />
        </button>
        <button className="nav-item">
          <FaBell />
        </button>
        <button className="nav-item">
          <FaEllipsisH />
        </button>
      </nav>
    </div>
  );
};

export default SideBar;
