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
import api from "../services/api";

const DMChatWindow = ({ userId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userIcon, setUserIcon] = useState("");
  const [file, setFile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // const fetchCurrentUser = async () => {
    //   try {
    //     const response = await api.get("/users/me", { withCredentials: true });
    //     console.log("Current User:", response.data);
    //     setCurrentUserId(response.data.id);
    //   } catch (error) {
    //     console.error("Error fetching current user:", error);
    //   }
    // };
    // fetchCurrentUser();

    const fetchMessages = async () => {
      try {
        // Fetch DM messages with this user
        const response = await axios.get(
          `https://traq.duckdns.org/api/v3/users/${userId}/messages`,
          { withCredentials: true }
        );
        console.log("Messages:", response.data);

        setMessages(
          response.data.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          )
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `https://traq.duckdns.org/api/v3/users/${userId}`,
          { withCredentials: true }
        );
        setUserName(response.data.displayName);

        const iconResponse = await axios.get(
          `https://traq.duckdns.org/api/v3/users/${userId}/icon`,
          { withCredentials: true, responseType: "blob" }
        );
        setUserIcon(URL.createObjectURL(iconResponse.data));
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchMessages();
    fetchUserInfo();
  }, [userId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    console.log("Sending message :", newMessage, " to user:", userId);

    try {
      const temp = await api.post(
        `/users/${userId}/messages`,
        { content: newMessage },
        { embed: false },
        { withCredentials: true }
      );
      console.log("Temp:", temp);

      const fetchMessages = async () => {
        try {
          // Fetch DM messages with this user
          const response = await axios.get(
            `https://traq.duckdns.org/api/v3/users/${userId}/messages`,
            { withCredentials: true }
          );

          setMessages(
            response.data.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            )
          );
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      setNewMessage("");
      fetchMessages();
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

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    // formData.append("channelId", channelId);

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

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <img src={userIcon} alt={userName} className="user-icon" />
        <h2>{userName}</h2>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      {/* <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="message-content">
              <span className="timestamp">{formatTime(msg.createdAt)}</span>
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}
      </div> */}
      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.userId === userId ? "received" : "sent"
            }`}
          >
            <div className="message-content">
              <span className="timestamp">{formatTime(msg.createdAt)}</span>
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      {/* <div className="message-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${userName}`}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="send-button" onClick={sendMessage}>
          <FaPaperPlane />
        </button>
      </div> */}
      <div className="message-input-container">
        <input
          className="message-input-input"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message #${userName}`}
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

export default DMChatWindow;
