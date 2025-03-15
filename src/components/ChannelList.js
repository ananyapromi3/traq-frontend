import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ChannelList.css";

const ChannelList = ({ onSelectChannel }) => {
  //   const [channels, setChannels] = useState([]);
  const [channels, setChannels] = useState({ public: [] });
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
        console.log("Channels:", response.data);
        setChannels(response.data || { public: [] });
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

  return (
    <div className="channel-list">
      <h3>Channels</h3>
      <ul>
        {channels.public.map((channel) => (
          <li
            key={channel.id}
            className={selectedChannel === channel.id ? "selected" : ""}
            onClick={() => handleChannelClick(channel.id)}
          >
            #{channel.name}
          </li>
        ))}
      </ul>
      {/* <pre>{JSON.stringify(channels, null, 2)}</pre> */}
    </div>
  );
};

export default ChannelList;
