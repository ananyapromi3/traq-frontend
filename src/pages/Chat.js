import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Chat.css";
import { omitUndefined } from "mongoose";

const Chat = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      const response = await axios.get(
        "https://traq.duckdns.org/api/v3/me/tokens",
        // {
        //   headers: { Authorization: `Bearer ${token}` },
        // }
        {
            Credentials: "include", // ✅ Ensures cookies are sent with the request
        }
      );
      setChannels(response.data);
    } catch (error) {
      console.error("Error fetching channels", error);
    }
  };

  const fetchMessages = async (channelId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://traq.duckdns.org/api/v3/channels/${channelId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data);
      setSelectedChannel(channelId);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://traq.duckdns.org/api/v3/channels/${selectedChannel}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      fetchMessages(selectedChannel);
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h2>Channels</h2>
        <ul>
          {channels.map((channel) => (
            <li key={channel.id} onClick={() => fetchMessages(channel.id)}>
              {channel.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-box">
        <h2>
          {selectedChannel ? `Channel: ${selectedChannel}` : "Select a channel"}
        </h2>
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              {msg.content}
            </div>
          ))}
        </div>
        <div className="input-box">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage} disabled={!selectedChannel}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
