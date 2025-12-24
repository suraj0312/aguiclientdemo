"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { myTheme } from "./AgGridTheme";
import styles from "./AgGridTable.module.css";
import { ColDef } from "ag-grid-community";
import { Agent } from "./MainLayout";
import { DescriptionCellRenderer } from "./DescriptionCellRenderer";

interface AgGridTableProps {
  agents: Agent[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AgGridTable({
  agents,
  selected,
  setSelected,
}: AgGridTableProps) {
  // Memoize column definitions based on agent type
  const columns: ColDef<Agent>[] = useMemo(() => {
    if (agents.length === 0) return [];

    const commonCheckboxColumn: ColDef<Agent> = {
      headerName: "",
      width: 50,
      cellRenderer: (params: any) => {
        const key = params.data.name + params.data.url;
        return (
          <input
            type="checkbox"
            checked={selected.includes(key)}
            onChange={() => {
              setSelected((prev) =>
                prev.includes(key)
                  ? prev.filter((k) => k !== key)
                  : [...prev, key]
              );
            }}
            aria-label={`Select agent ${params.data.name}`}
          />
        );
      },
      pinned: "left",
      cellStyle: { display: "flex", justifyContent: "center" },
    };

    if (agents[0].type === "a2a_agent" || agents[0].type === "local_agent") {
      return [
        commonCheckboxColumn,
        {
          headerName: "Agent Name",
          field: "name",
          flex: 0.75,
          autoHeight: true,
          resizable: true,
          cellRenderer: DescriptionCellRenderer,
        },
        // {
        //   headerName: "Description",
        //   field: "description",
        //   flex: 1,
        //   autoHeight: true,
        //   resizable: true,
        //   cellRenderer: DescriptionCellRenderer,
        // },
        {
          headerName: "Agent Instructions",
          field: "instructions",
          flex: 1,
          autoHeight: true,
          resizable: true,
          cellRenderer: DescriptionCellRenderer,
        },
        {
          headerName: "Agent Framework",
          field: "framework",
          flex: 0.5,
          pinned: "right",
        },
      ];
    }

    if (agents[0].type === "mcp") {
      return [
        commonCheckboxColumn,
        {
          headerName: "MCP Name",
          field: "name",
          flex: 2,
          // wrapText: true,
          autoHeight: true,
          resizable: true,
        },
        {
          headerName: "MCP URL",
          field: "url",
          flex: 1,
          autoHeight: true,
          resizable: true,
        },
        {
          headerName: "MCP Server Type",
          field: "metaData.mcp_server_type",
          flex: 1,
          autoHeight: true,
          resizable: true,
        },
      ];
    }

    return [];
  }, [agents, selected, setSelected]);

  return (
    <div className={styles.tableDiv}>
      <AgGridReact
        theme={myTheme}
        rowData={agents}
        columnDefs={columns}
        domLayout="autoHeight"
        suppressMovableColumns={true}
      />
    </div>
  );
}