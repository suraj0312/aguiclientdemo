import React from "react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  onChat: () => void;
  onAddAgent: () => void;
  onCreateMultiAgent: () => void;
  onListA2AAgents: () => void;
  onListOrchestrators: () => void;
  onCreateLocalAgent: () => void;
  onListLocalAgent: () => void;
  onAddMcp: () => void;
  onListMCPs: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeButton: string;
}

export default function Sidebar({
  onChat,
  onAddAgent,
  onCreateMultiAgent,
  onListA2AAgents,
  onListOrchestrators,
  onCreateLocalAgent,
  onListLocalAgent,
  onAddMcp,
  onListMCPs,
  collapsed,
  setCollapsed,
  activeButton,
}: SidebarProps) {
  return (
    <div className={collapsed ? styles.sidebarCollapsed : styles.sidebar}>
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
      >
        {collapsed ? ">" : "<"}
      </button>

      {!collapsed && (
        <div className={`${styles.buttonContainer} ${styles.customScrollbar}`}>
          <button
            className={`${styles.actionBtn} ${
              activeButton === "addAgent" ? styles.active : ""
            }`}
            onClick={onAddAgent}
          >
            <h3>Add A2A Agent</h3>
          </button>

          <button
            className={`${styles.actionBtn} ${
              activeButton === "listA2AAgents" ? styles.active : ""
            }`}
            onClick={onListA2AAgents}
          >
            <h3>List A2A Agents</h3>
          </button>

          <button
            className={`${styles.actionBtn} ${
              activeButton === "createMultiAgent" ? styles.active : ""
            }`}
            onClick={onCreateMultiAgent}
          >
            <h3>Create Orchestrator</h3>
          </button>

          <button
            className={`${styles.actionBtn} ${
              activeButton === "listOrchestrators" ? styles.active : ""
            }`}
            onClick={onListOrchestrators}
          >
            <h3>List Orchestrators</h3>
          </button>

          <button
            className={`${styles.actionBtn} ${
              activeButton === "addMcp" ? styles.active : ""
            }`}
            onClick={onAddMcp}
          >
            <h3>Add MCP</h3>
          </button>

          <button
            className={`${styles.actionBtn} ${
              activeButton === "listMCPs" ? styles.active : ""
            }`}
            onClick={onListMCPs}
          >
            <h3>List MCPs</h3>
          </button>
          
          <button
            className={`${styles.actionBtn} ${
              activeButton === "createLocalAgent" ? styles.active : ""
            }`}
            onClick={onCreateLocalAgent}
          >
            <h3>Create Agent</h3>
          </button>

          <button
            className={`${styles.actionBtn} ${
              activeButton === "listLocalAgents" ? styles.active : ""
            }`}
            onClick={onListLocalAgent}
          >
            <h3>List Agents</h3>
          </button>

        </div>
      )}
    </div>
  );
}