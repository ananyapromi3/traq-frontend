import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Dashboard.css";
import SideBar from "./SideBar";
import ChannelList from "./ChannelList";
import ChatWindow from "./ChatWindow";
import ActivityFeed from "./ActivityFeed";
import GroupList from "./GroupList";
import {
  FaHome,
  FaBell,
  FaInbox,
  FaEllipsisH,
  FaLogo,
  FaSignOutAlt,
} from "react-icons/fa";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchSecuredData = async () => {
      try {
        // Example of accessing a secured endpoint
        const response = await api.get("/users/me");
        // console.log("Secured Data:", response.data);
        setUserData(response.data);
      } catch (err) {
        setError("Failed to load secure data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSecuredData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="loading">Loading secure data...</div>;
  }
  // console.log("Selected Channel:", selectedChannel);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Welcome to the Secured Dashboard</h2>
        <button onClick={handleLogout} className="nav-item">
          <FaSignOutAlt />
        </button>
      </div>

      {/* Main Layout */}
      <div className="dashboard-main">
        {/* Sidebar */}
        <SideBar />
        {/* Activity Feed in the Middle (Like the Image) */}
        <div className="activity-container">
          <ActivityFeed activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === "threads" && (
            <ChannelList onSelectChannel={setSelectedChannel} />
          )}
          {activeTab === "mentions" && (
            <GroupList onSelectChannel={setSelectedChannel} />
          )}
        </div>
        {/* <ActivityFeed activeTab={activeTab} setActiveTab={setActiveTab} /> */}
        {/* Show Channel List ONLY when "All" tab is selected */}
        {/* {activeTab === "all" && (
          <ChannelList onSelectChannel={setSelectedChannel} />
        )} */}

        {/* Channel List */}
        {/* <ChannelList onSelectChannel={setSelectedChannel} /> */}

        {/* Chat Window */}
        {selectedChannel ? (
          <ChatWindow
            channelId={selectedChannel}
            channelName={`Channel ${selectedChannel}`}
            onClose={() => setSelectedChannel(null)}
          />
        ) : (
          <div className="placeholder">Select a channel to start chatting</div>
        )}
      </div>
      {/* <div className="dashboard-footer">
        <h2>Welcome to the Secured Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div> */}
    </div>
  );
}

export default Dashboard;
