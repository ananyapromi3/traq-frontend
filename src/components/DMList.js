import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../services/api";
import "../styles/DMList.css";

const DMlList = ({ onSelectUser }) => {
  //   const [channels, setChannels] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsersAndMessages = async () => {
      try {
        // Fetch current user ID
        const meResponse = await api.get("/users/me");
        setUserId(meResponse.data.id);

        // Fetch all users
        const usersResponse = await api.get("/users");
        const allUsers = usersResponse.data;

        // Fetch last message for each user
        const userMessagePromises = allUsers.map(async (user) => {
          const messagesResponse = await api.get(
            `/users/${user.id}/messages?limit=1`
          );
          const lastMessage = messagesResponse.data?.[0] || null;
          return { ...user, lastMessage };
        });

        let usersWithMessages = await Promise.all(userMessagePromises);
        // console.log("Users with messages:", usersWithMessages);

        // Fetch user icons
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

        // Attach icons to users
        usersWithMessages = usersWithMessages.map((user) => {
          const userIcon = userIcons.find((icon) => icon.userId === user.id);
          return {
            ...user,
            iconUrl: userIcon?.iconUrl || "/default-avatar.png",
          };
        });

        // Sort users by last message timestamp
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

    fetchUsersAndMessages();
  }, []);

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
    onSelectUser(userId);
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  return (
    <div className="dm-list">
      <ul>
        {users.map((user) => (
          <li
            key={user.id}
            onClick={() => handleUserClick(user.id)}
            className={`dm-item ${selectedUser === user.id ? "selected" : ""}`}
            // className="dm-item"
          >
            {/* <div className="dm-header">
              <img src={user.iconUrl} alt="User Icon" className="user-icon" />
              <div className="message-details">
                <span className="sender-name">{user.name}</span>
                <span className="preview"> {user.lastMessage?.content || "No messages yet"} </span>
                {user.lastMessage && (
                  <>
                    <span className="preview">{user.lastMessage.content}</span>
                    <span className="timestamp">
                      {formatTime(user.lastMessage.updatedAt)}
                    </span>
                  </>
                )}
              </div>
            </div> */}
            {/* <div className="channel-header">
              <div className="channel-name"></div>
              {user.lastMessage && (
                <span className="timestamp">
                  {formatTime(user.lastMessage.updatedAt)}
                </span>
              )}
            </div> */}
            {user.lastMessage && (
              <div className="dm-content">
                <img
                  src={user.iconUrl || "/default-avatar.png"}
                  alt="User Icon"
                  className="user-icon"
                />
                <div className="message-details">
                  <span className="sender-name">{user.name || "Unknown"}</span>
                  <span className="timestamp">
                    {formatTime(user.lastMessage.updatedAt)}
                  </span>
                  <span className="preview">
                    {user.lastMessage?.content || "No messages yet"}
                  </span>
                </div>
              </div>
            )}
            {!user.lastMessage && (
              <div className="channel-content">
                <img
                  src={user.iconUrl || "/default-avatar.png"}
                  alt="User Icon"
                  className="user-icon"
                />
                <div className="message-details">
                  <span className="sender-name">{user.name || "Unknown"}</span>
                  <span className="preview">
                    {user.lastMessage?.content || "No messages yet"}
                  </span>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DMlList;
