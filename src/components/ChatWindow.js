import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUsers,
  FaBookmark,
  FaTimes,
  FaPaperclip,
  FaSmile,
  FaPaperPlane,
  FaPlus,
  FaMicrophone,
  FaFont,
} from "react-icons/fa";
import "../styles/ChatWindow.css";

const ChatWindow = ({ channelId, onClose, refreshChannels }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState({});
  const [userIcons, setUserIcons] = useState({});
  const [memberCount, setMemberCount] = useState(0);
  const [channelName, setChannelName] = useState("");
  const [pinned, setPinned] = useState(0);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        const response1 = await axios.get(
          `https://traq.duckdns.org/api/v3/channels/${channelId}`,
          { withCredentials: true }
        );
        // console.log("Channel Data:", response1.data);
        setChannelName(response1.data.name);

        const response = await axios.get(
          `https://traq.duckdns.org/api/v3/channels/${channelId}/messages`,
          { withCredentials: true }
        );

        const messagesData = response.data;
        const userIds = [...new Set(messagesData.map((msg) => msg.userId))];

        const response2 = await axios.get(
          `https://traq.duckdns.org/api/v3/channels/${channelId}/pins`,
          { withCredentials: true }
        );
        //   console.log("Pinned Data:", response2);
        setPinned(response2.data.length);

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
        // console.log("Member Count:", response);
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
      refreshChannels();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("channelId", channelId);

    try {
      await axios.post("https://traq.duckdns.org/api/v3/files", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
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
            <FaBookmark /> {pinned} Pinned
          </button>
          <button className="close-button" onClick={onClose}>
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

      <div className="message-input-container">
        <input
          className="message-input-input"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message #${channelName}`}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="file-input"
        />
        <div className="message-box">
          <div className="message-input">
            <button className="icon-button" onClick={uploadFile}>
              <FaPlus />
            </button>
            <button className="icon-button">
              <FaMicrophone />
            </button>
            <button className="icon-button">
              <FaSmile />
            </button>
            <button className="icon-button">
              <FaFont />
            </button>
          </div>
          <button className="send-button" onClick={sendMessage}>
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
