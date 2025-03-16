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
import DMlList from "./DMList";
import DMChatWindow from "./DMChatWindow";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDM, setSelectedDM] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

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

  const fetchUsersAndMessages = async () => {
    try {
      const meResponse = await api.get("/users/me");
      const userId = meResponse.data.id;

      const usersResponse = await api.get("/users");
      const allUsers = usersResponse.data;

      const userMessagePromises = allUsers.map(async (user) => {
        const messagesResponse = await api.get(
          `/users/${user.id}/messages?limit=1`
        );
        const lastMessage = messagesResponse.data?.[0] || null;
        return { ...user, lastMessage };
      });

      let usersWithMessages = await Promise.all(userMessagePromises);

      const userIconPromises = allUsers.map(async (user) => {
        try {
          const iconResponse = await api.get(`/users/${user.id}/icon`, {
            responseType: "blob",
          });
          const iconUrl = URL.createObjectURL(iconResponse.data);
          return { userId: user.id, iconUrl };
        } catch {
          return { userId: user.id, iconUrl: "/default-avatar.png" };
        }
      });

      const userIcons = await Promise.all(userIconPromises);

      usersWithMessages = usersWithMessages.map((user) => {
        const userIcon = userIcons.find((icon) => icon.userId === user.id);
        return {
          ...user,
          iconUrl: userIcon?.iconUrl || "/default-avatar.png",
        };
      });

      usersWithMessages.sort((a, b) => {
        const timeA = a.lastMessage?.updatedAt
          ? new Date(a.lastMessage.updatedAt).getTime()
          : 0;
        const timeB = b.lastMessage?.updatedAt
          ? new Date(b.lastMessage.updatedAt).getTime()
          : 0;
        return timeB - timeA;
      });

      setUsers(usersWithMessages);
    } catch (error) {
      console.error("Error fetching users and messages:", error);
    }
  };

  useEffect(() => {
    fetchUsersAndMessages();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="loading">Loading secure data...</div>;
  }

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
          {activeTab === "all" && (
            <DMlList
              onSelectUser={setSelectedDM}
              refreshDMList={fetchUsersAndMessages}
            />
          )}
        </div>

        {/* Chat Window
        {activeTab === "threads" && selectedChannel ? (
          <ChatWindow
            channelId={selectedChannel}
            channelName={`Channel ${selectedChannel}`}
            onClose={() => setSelectedChannel(null)}
          />
        ) : (
          <div className="placeholder">
            Select a channel or user to start chatting
          </div>
        )}
        {activeTab === "all" && selectedDM ? (
          <DMChatWindow
            userId={selectedChannel}
            onClose={() => setSelectedChannel(null)}
          />
        ) : (
          <div className="placeholder">
            Select a channel or user to start chatting
          </div>
        )} */}
        {/* Chat Window */}
        {selectedChannel || selectedDM ? (
          activeTab === "threads" ? (
            <ChatWindow
              channelId={selectedChannel}
              channelName={`Channel ${selectedChannel}`}
              onClose={() => setSelectedChannel(null)}
            />
          ) : (
            <DMChatWindow
              userId={selectedDM}
              onClose={() => setSelectedDM(null)}
            />
          )
        ) : (
          <div className="placeholder">
            Select a channel or user to start chatting
          </div>
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
