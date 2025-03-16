import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../services/api";
import "../styles/ChannelList.css";

const ChannelList = ({ onSelectChannel }) => {
  //   const [channels, setChannels] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get(
          "https://traq.duckdns.org/api/v3/channels?include-dm=false",
          {
            withCredentials: true,
          }
        );
        // setChannels(response.data);
        // console.log("Channels:", response.data);
        const channelsData = response.data.public || [];
        // console.log("Channels Data:", channelsData);

        // Fetch the last message for each channel
        const channelPromises = channelsData.map(async (channel) => {
          //   console.log("Channel:", channel);
          const messageResponse = await api.get(
            `/channels/${channel.id}/messages?limit=1`
          );
          const lastMessage = messageResponse.data?.[0] || null; // Get the latest message

          return {
            ...channel,
            lastMessage, // Attach last message info
          };
        });

        // Wait for all messages to be fetched
        const channelsWithMessages = await Promise.all(channelPromises);

        // Extract unique userIds from last messages
        const userIds = [
          ...new Set(
            channelsWithMessages
              .map((channel) => channel.lastMessage?.userId)
              .filter(Boolean)
          ),
        ]; // Remove undefined/null values

        const userResponses = await Promise.all(
          userIds.map((userId) => api.get(`/users/${userId}`))
        );

        // Fetch user icons as binary and convert them
        const userIconPromises = userIds.map(async (userId) => {
          const iconResponse = await api.get(`/users/${userId}/icon`, {
            responseType: "blob", // Get binary image data
          });

          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(iconResponse.data); // Convert Blob to Base64 URL
            reader.onloadend = () =>
              resolve({ userId, iconUrl: reader.result });
          });
        });

        const userIcons = await Promise.all(userIconPromises);

        // Create user data mapping { userId: { name, iconUrl } }
        const userMap = {};
        userResponses.forEach(({ data }) => {
          userMap[data.id] = {
            name: data.name,
            iconUrl: "/default-avatar.png",
          };
        });

        // Attach icons to userMap
        userIcons.forEach(({ userId, iconUrl }) => {
          if (userMap[userId]) {
            userMap[userId].iconUrl = iconUrl;
          }
        });

        // // Create a user mapping { userId: { name, iconUrl } }
        // const userMap = {};
        // userResponse.forEach(({ data }) => {
        //   userMap[data.id] = {
        //     name: data.name,
        //     iconUrl: data.iconUrl,
        //   };
        // });

        // Assign sender details to last messages
        const updatedChannels = channelsWithMessages.map((channel) => {
          if (channel.lastMessage) {
            const userData = userMap[channel.lastMessage.userId] || {};
            channel.lastMessage.sender = userData.name || "Unknown";
            channel.lastMessage.senderIcon =
              userData.iconUrl || "/default-avatar.png";
          }
          return channel;
        });

        // Sort channels by last message timestamp (descending)
        channelsWithMessages.sort((a, b) => {
          //   if (!a.lastMessage || !b.lastMessage) return 0;
          //   return (
          //     new Date(b.lastMessage.updatedAt) -
          //     new Date(a.lastMessage.updatedAt)
          //   );
          const timeA = a.lastMessage?.updatedAt
            ? new Date(a.lastMessage.updatedAt).getTime()
            : 0;
          const timeB = b.lastMessage?.updatedAt
            ? new Date(b.lastMessage.updatedAt).getTime()
            : 0;

          return timeB - timeA;
        });
        setChannels(channelsWithMessages);
        // setChannels(response.data || { public: [] });
      } catch (error) {
        setChannels({ public: [] });
        console.error("Error fetching channels:", error);
      }
    };

    fetchChannels();
  }, []);

  const handleChannelClick = (channelId) => {
    setSelectedChannel(channelId);
    onSelectChannel(channelId);
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
    <div className="channel-list">
      {/* <h3>Channels</h3> */}
      <ul>
        {channels.map((channel) => (
          <li
            key={channel.id}
            onClick={() => handleChannelClick(channel.id)}
            // className="channel-item"
            className={`channel-item ${selectedChannel === channel.id ? "selected" : ""}`}
          >
            <div className="channel-header">
              <div className="channel-name">
                new message in <b>#{channel.name}</b>
              </div>
              {channel.lastMessage && (
                <span className="timestamp">
                  {formatTime(channel.lastMessage.updatedAt)}
                </span>
              )}
            </div>
            {channel.lastMessage && (
              <div className="channel-content">
                <img
                  src={channel.lastMessage?.senderIcon || "/default-avatar.png"}
                  alt="User Icon"
                  className="user-icon"
                />
                <div className="message-details">
                  <span className="sender-name">
                    {channel.lastMessage?.sender || "Unknown"}
                  </span>
                  <span className="preview">
                    {channel.lastMessage?.content || "No messages yet"}
                  </span>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {/* <pre>{JSON.stringify(channels, null, 2)}</pre> */}
    </div>
  );
};

export default ChannelList;
