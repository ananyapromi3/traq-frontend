import React, { useState, useEffect } from "react";
import { FaHome, FaBell, FaInbox, FaEllipsisH } from "react-icons/fa";
import "../styles/Sidebar.css";
import { useAuth } from "../context/AuthContext";

const SideBar = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png");

  useEffect(() => {
    if (user?.id) {
      setAvatarUrl(`https://traq.duckdns.org/api/v3/users/${user.id}/icon`);
    }
  }, [user]);

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <button className="nav-item">
          <FaHome />
        </button>
        <button className="nav-item active">
          <FaInbox />
        </button>
        <button className="nav-item">
          <FaBell />
        </button>
        <button className="nav-item">
          <FaEllipsisH />
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="bottom-avatar">
          <img src={avatarUrl} alt="User Avatar" className="bottom-avatar" />
          <span className="online-status"></span>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
