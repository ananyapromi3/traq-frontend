import React, { useState, useEffect, useRef } from "react";
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
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import "../styles/ChatWindow.css";
import EmojiPicker from "emoji-picker-react";

const ChatWindow = ({ channelId, onClose, refreshChannels }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState({});
  const [userIcons, setUserIcons] = useState({});
  const [memberCount, setMemberCount] = useState(0);
  const [channelName, setChannelName] = useState("");
  const [pinned, setPinned] = useState(0);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);

  const toggleFileInput = () => {
    setShowFileInput((prev) => !prev);
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.native); // Append emoji to text
    setShowEmojiPicker(false); // Hide picker after selection
  };

  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        const scrollToBottom = () => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };

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
        setTimeout(() => scrollToBottom(), 100);
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
    setShowEmojiPicker(false); // Hide picker after sending
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
      setShowFileInput(false);
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
        <div className="channel-header">
          <h2 className="channel-name-header">#{channelName}</h2>
          <button className="icon-button-1">
            <IoIosArrowDown />
          </button>
        </div>
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
      {showEmojiPicker && (
        <div className="emoji-picker">
          <EmojiPicker
            onEmojiClick={(emoji) =>
              setNewMessage((prev) => prev + emoji.emoji)
            }
          />
        </div>
      )}

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
        {showFileInput && (
          <div className="file-upload">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="file-input"
            />
            <button className="submit-button" onClick={uploadFile}>
              Upload
            </button>
          </div>
        )}
        <div className="message-box">
          <div className="message-input">
            <button className="icon-button" onClick={toggleFileInput}>
              <FaPlus />
            </button>
            <button className="icon-button">
              <FaMicrophone />
            </button>
            <button
              className="icon-button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
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
