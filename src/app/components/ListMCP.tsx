import React, { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import styles from "./ListA2AAgents.module.css";
import { myTheme } from "./AgGridTheme";
import { ColDef } from "ag-grid-community";
import { Agent } from "./MainLayout";
import { DescriptionCellRenderer } from "./DescriptionCellRenderer";

interface ListMCPProps {
  agents: Agent[];
  onDeleteAgent: (agent: Agent) => void;
  onViewCard: (agent: Agent) => void;
}

export default function ListMCP({
  agents,
  onDeleteAgent,
  onViewCard,
}: ListMCPProps) {
  const gridRef = useRef<AgGridReact<Agent>>(null);

const columns: ColDef<Agent>[] = useMemo(() => [
  {
    headerName: "MCP Name",
    field: "name", // ✅ valid key of Agent
    sortable: true,
    filter: true,
  },
  {
    headerName: "Description",
    field: "description",
    flex: 1,
    resizable: true,
    filter: true,
    cellRenderer: DescriptionCellRenderer,
  },
  {
    headerName: "MCP URL",
    field: "url",
    flex: 1,
    wrapText: true,
    autoHeight: true,
    resizable: true,
    filter: true,
  },
  {
    headerName: "MCP Framework",
    field: "framework",
    flex: 0.5,
    filter: true,
  },
  {
    headerName: "MCP Server Type",
    field: "metaData.mcp_server_type",
    flex: 0.5,
    filter: true,
  },
  {
    headerName: "View Card",
    // 👇 This field doesn't exist in Agent, so we omit `field` and use `cellRenderer` only
    // field: "delete",
    cellRenderer: (params: any) => (
      <button
        className={styles.viewCardBtn}
        onClick={() => onViewCard(params.data)}
        aria-label={`View Agent Card for ${params.data.name}`}
      >
        <svg fill="#aaaaaa" width="28px" height="28px" viewBox="-2 -5.5 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin" stroke="#aaaaaa" strokeWidth="0.00024000000000000003">
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M2 0h16c1.105 0 2 .831 2 1.857v9.286C20 12.169 19.105 13 18 13H2c-1.105 0-2-.831-2-1.857V1.857C0 .831.895 0 2 0zm9 3a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-6zm0 3a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-6zM3 3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3z">
            </path>
          </g>
        </svg>
      </button>
    ),
    width: 80,
    pinned: "right",
    cellStyle: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  },
  {
    headerName: "Delete",

    cellRenderer: (params:any) => (
      <button
        className={styles.deleteBtn}
        onClick={() => onDeleteAgent(params.data)}
        aria-label={`Delete agent ${params.data.name}`}
      >
        <svg
              fill="#aaaaaa"
              height="24"
              width="24"
              viewBox="0 0 24 24"
              stroke="#aaaaaa"
              strokeWidth="0.5"
            >
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      </button>
    ),
    width: 80,
    pinned: "right",
    cellStyle: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  },
], [onDeleteAgent]);
  return (
    <div className={styles.Window}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Available MCPs</h2>
        </div>
      </div>

      <div className={styles.separator}></div>

      <div className={`${styles.tableContainer} ${styles.customScrollbar}`}>
        <AgGridReact
          theme={myTheme}
          ref={gridRef}
          rowData={agents.filter((a) => a.type === "mcp")}
          columnDefs={columns}
          domLayout="autoHeight"
          rowSelection="single"
          suppressMovableColumns={true}
        />
      </div>
    </div>
  );
}






