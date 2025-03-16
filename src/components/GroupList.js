import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../services/api";
import "../styles/GroupList.css";

const GroupList = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          "https://traq.duckdns.org/api/v3/groups?include-dm=false",
          { withCredentials: true }
        );
        let groupData = response.data;

        // Fetch icons for each group
        const groupIconPromises = groupData.map(async (group) => {
          try {
            const iconResponse = await api.get(`/groups/${group.id}/icon`, {
              responseType: "blob",
            });
            const iconUrl = URL.createObjectURL(iconResponse.data);
            return { groupId: group.id, iconUrl };
          } catch {
            return { groupId: group.id, iconUrl: "/default-group-icon.png" };
          }
        });

        const groupIcons = await Promise.all(groupIconPromises);

        // Attach icons to groups
        groupData = groupData.map((group) => {
          const groupIcon = groupIcons.find((icon) => icon.groupId === group.id);
          return { ...group, iconUrl: groupIcon?.iconUrl || "/default-group-icon.png" };
        });

        // Sort groups by last updated time
        groupData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setGroups(groupData);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (groupId) => {
    setSelectedGroup(groupId);
    // onSelectGroup(groupId);
  };

  return (
    <div className="group-list">
      <ul>
        {groups.map((group) => (
          <li
            key={group.id}
            onClick={() => handleGroupClick(group.id)}
            className={`group-item ${selectedGroup === group.id ? "selected" : ""}`}
          >
            <div className="group-content">
              <img src={group.iconUrl} alt="Group Icon" className="group-icon" />
              <div className="group-details">
                <span className="group-name">{group.name}</span>
                <span className="group-description">{group.description || "No description"}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
