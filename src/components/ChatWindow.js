import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUsers,
  FaBookmark,
  FaTimes,
  FaPaperclip,
  FaSmile,
  FaPaperPlane,
} from "react-icons/fa";
import "../styles/ChatWindow.css";

const ChatWindow = ({ channelId, channelName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState({});
  const [userIcons, setUserIcons] = useState({});
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `https://traq.duckdns.org/api/v3/channels/${channelId}/messages`,
          { withCredentials: true }
        );

        const messagesData = response.data;
        const userIds = [...new Set(messagesData.map((msg) => msg.userId))];

        const userRequests = userIds.map((id) =>
          axios.get(`https://traq.duckdns.org/api/v3/users/${id}`, {
            withCredentials: true,
          })
        );
        const userResponses = await Promise.all(userRequests);

        const userMap = {};
        userResponses.forEach((res) => {
          userMap[res.data.id] = res.data.displayName;
        });
        setUsers(userMap);

        const userIconRequests = userIds.map((id) =>
          axios.get(`https://traq.duckdns.org/api/v3/users/${id}/icon`, {
            withCredentials: true,
            responseType: "blob",
          })
        );
        const userIconResponses = await Promise.all(userIconRequests);

        const userIconMap = {};
        userIds.forEach((id, index) => {
          const imageUrl = URL.createObjectURL(userIconResponses[index].data);
          userIconMap[id] = imageUrl;
        });
        setUserIcons(userIconMap);

        messagesData.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const fetchMemberCount = async () => {
      try {
        const response = await axios.get(
          `https://traq.duckdns.org/api/v3/channels/${channelId}/stats`,
          { withCredentials: true }
        );
        console.log("Member Count:", response);
        setMemberCount(response.data.users.length);
      } catch (error) {
        console.error("Error fetching member count:", error);
      }
    };

    fetchMessages();
    fetchMemberCount();
  }, [channelId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(
        `https://traq.duckdns.org/api/v3/channels/${channelId}/messages`,
        { content: newMessage },
        { withCredentials: true }
      );

      setNewMessage("");
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `https://traq.duckdns.org/api/v3/channels/${channelId}/messages`,
            { withCredentials: true }
          );

          const messagesData = response.data;
          const userIds = [...new Set(messagesData.map((msg) => msg.userId))];

          const userRequests = userIds.map((id) =>
            axios.get(`https://traq.duckdns.org/api/v3/users/${id}`, {
              withCredentials: true,
            })
          );
          const userResponses = await Promise.all(userRequests);

          const userMap = {};
          userResponses.forEach((res) => {
            userMap[res.data.id] = res.data.displayName;
          });
          setUsers(userMap);

          const userIconRequests = userIds.map((id) =>
            axios.get(`https://traq.duckdns.org/api/v3/users/${id}/icon`, {
              withCredentials: true,
              responseType: "blob",
            })
          );
          const userIconResponses = await Promise.all(userIconRequests);

          const userIconMap = {};
          userIds.forEach((id, index) => {
            const imageUrl = URL.createObjectURL(userIconResponses[index].data);
            userIconMap[id] = imageUrl;
          });
          setUserIcons(userIconMap);

          messagesData.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          setMessages(messagesData);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages(); // Reload messages after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <h2>#{channelName}</h2>
        <div className="chat-actions">
          <button className="icon-button">
            <FaUsers /> {memberCount}
          </button>
          <button className="icon-button">
            <FaBookmark /> 5 Pinned
          </button>
          <button className="icon-button close-button">
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <img
              src={userIcons[msg.userId]}
              alt="User Icon"
              className="user-icon"
            />
            <div className="message-content">
              <div>
                <span className="user-name">{users[msg.userId]}</span>
                <span className="timestamp">{formatTime(msg.createdAt)}</span>
              </div>
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="message-input">
        <button className="icon-button">
          <FaPaperclip />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message #${channelName}`}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="icon-button">
          <FaSmile />
        </button>
        <button className="send-button" onClick={sendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
