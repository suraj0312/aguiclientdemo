import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import styles from "./ListLocalAgents.module.css";
import { myTheme } from "./AgGridTheme";
import { ColDef } from "ag-grid-community";
import { Agent } from "./MainLayout";
import { DescriptionCellRenderer } from "./DescriptionCellRenderer";

interface ListLocalAgentsProps {
  agents: Agent[];
  onDeleteLocalAgent: (agent: Agent) => void;
  onEditLocalAgent: (agent: Agent) => void;
}

export default function ListLocalAgents({
  agents,
  onDeleteLocalAgent,
  onEditLocalAgent,
}: ListLocalAgentsProps) {
  const gridRef = useRef<AgGridReact<Agent>>(null);

  const columns: ColDef<Agent>[] = useMemo(
    () => [
      {
        headerName: "Local Agent Name",
        field: "name",
        sortable: true,
        filter: true,
        cellRenderer: DescriptionCellRenderer,
      },
      {
        headerName: "System Instructions",
        field: "instructions",
        flex: 1,
        // wrapText: true,
        autoHeight: true,
        resizable: true,
        filter: true,
        cellRenderer: DescriptionCellRenderer,
      },
      {
        headerName: "Description",
        field: "description",
        flex: 1,
        // wrapText: true,
        autoHeight: true,
        resizable: true,
        filter: true,
        cellRenderer: DescriptionCellRenderer,
      },
      {
        headerName: "Agent Usage",
        field: "usage",
        flex: 0.5,
      },
      {
        headerName: "Configure",
        // field: "edit",
        cellRenderer: (params: any) => (
          <button
            className={styles.editBtn}
            onClick={() => onEditLocalAgent(params.data)}
            aria-label={`Edit agent ${params.data.name}`}
          >
            <svg
              fill="#aaaaaa"
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              stroke="#aaaaaa"
              strokeWidth="0.5"
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
            </svg>
          </button>
        ),
        width: 100,
        pinned: "right",
      },
      {
        headerName: "Delete",
        // field: "delete",
        cellRenderer: (params: any) => (
          <button
            className={styles.deleteBtn}
            onClick={() => onDeleteLocalAgent(params.data)}
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
        width: 120,
        pinned: "right",
      },
    ],
    [onDeleteLocalAgent, onEditLocalAgent]
  );

  return (
    <div className={styles.Window}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Available Local Agents</h2>
        </div>
      </div>

      <div className={styles.separator}></div>

      <div className={`${styles.tableContainer} ${styles.customScrollbar}`}>
        <AgGridReact
          theme={myTheme}
          ref={gridRef}
          rowData={agents.filter((o) => o.type === "local_agent")}
          columnDefs={columns}
          domLayout="autoHeight"
          rowSelection="single"
          suppressMovableColumns={true}
        />
      </div>
    </div>
  );
}
