import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/ActivityFeed.css";
import ChannelList from "./ChannelList";

const ActivityFeed = ({ activeTab, setActiveTab }) => {
  const [activity, setActivity] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  // setSelectedChannel(selectedChannel1);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await api.get("/users/me/notifications");
        setActivity(response.data);
      } catch (error) {
        console.error("Error fetching activity feed:", error);
      }
    };

    fetchActivity();
  }, []);

  return (
    <div className="activity-feed">
      <h2 className="activity-name">Activity</h2>
      {/* Header */}
      <div className="activity-header">
        {/* <h2>Activity</h2>
        <br /> */}
        <div className="tabs">
          {["all", "mentions", "threads", "reactions", "..."].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
