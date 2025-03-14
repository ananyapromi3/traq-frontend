import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ChatWindow.css";

const ChatWindow = ({ channelId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState({}); // Store user data

  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `https://traq.duckdns.org/api/v3/channels/${channelId}/messages`,
          { withCredentials: true }
        );

        const messagesData = response.data;

        // Extract unique userIds
        const userIds = [...new Set(messagesData.map((msg) => msg.userId))];

        // Fetch user details
        const userRequests = userIds.map((id) =>
          axios.get(`https://traq.duckdns.org/api/v3/users/${id}`, {
            withCredentials: true,
          })
        );

        const userResponses = await Promise.all(userRequests);
        console.log("User Responses:", userResponses);

        // Create a userId-to-username map
        const userMap = {};
        userResponses.forEach((res) => {
          userMap[res.data.id] = res.data.displayName;
        });
        setUsers(userMap);

        setMessages(response.data);
        console.log("Messages:", response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
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
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <strong>{users[msg.userId]}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
