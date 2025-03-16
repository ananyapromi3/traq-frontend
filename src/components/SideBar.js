import React, { useState, useEffect } from "react";
import { FaHome, FaBell, FaInbox, FaEllipsisH } from "react-icons/fa";
import "../styles/Sidebar.css";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const SideBar = () => {
  //   const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);
  //   const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await axios.get(
          `https://traq.duckdns.org/api/v3/users/me/icon`,
          {
            withCredentials: true,
            responseType: "blob",
          }
        );

        const imageUrl = URL.createObjectURL(response.data);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.error("Failed to fetch avatar:", error);
        setAvatarUrl("/default-avatar.png"); // Fallback avatar
      }
    };

    fetchAvatar();

    // Cleanup function to prevent memory leaks
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, []);
  
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
