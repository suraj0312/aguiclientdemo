import React, { useState } from "react";
import styles from "./AddMcp.module.css";
import { useCopilotContext } from "@copilotkit/react-core";
import { Agent } from "./MainLayout";
import { connect } from "http2";
import { connection } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface AddAgentModalProps {
    onAdd: (agent: {
        name: string;
        url: string;
        subAgents: Agent[];
        instructions: string;
        framework: string;
        description: string;
        type: string;
        session_id: string;
        usage: number;
        metaData: Record<string, any>;
    }) => void;
    onCancel: () => void;
}

interface McpDetails {
    toolsDetail: { name: string, description: string }[]
}

export default function AddAgentModal({ onAdd, onCancel }: AddAgentModalProps) {
    const CONNECTION_TYPES = ["Select", "Stdio", "SSE", "Http Streamable"]
    const [selectedConnectionType, setSelectedConnectionType] = useState("Select");
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [mcpServerType, setMcpServerType] = useState("Frontend");
    const [toolsDetail, setToolsDetail] = useState<{ name: string, description: string }[]>([]);
    const [mcpDetailsLoaded, setMcpDetailsLoaded] = useState(false);
    // const [mcpDetails, setMcpDetails] = useState<McpDetails>({ toolsDetail: [] });
    const [errorMessage, setErrorMessage] = useState("");
    const [mcpDescription, setMcpDescription] = useState("")
    // const threadId = useCopilotContext().threadId;
    const isFormValid = name.trim() !== "" && url.trim() !== "";

    const [headers, setHeaders] = useState([{ key: "", value: "" }]);


    const handleHeaderChange = (index: number, field: "key" | "value", value: string) => {
        const updatedHeaders = [...headers];
        updatedHeaders[index][field] = value;
        setHeaders(updatedHeaders);
    };

    const addHeaderRow = () => {
        setHeaders([...headers, { key: "", value: "" }]);
    };

    const removeHeaderRow = (index: number) => {
        const updatedHeaders = headers.filter((_, i) => i !== index);
        setHeaders(updatedHeaders);
    };

    const convertHeadersToJsonString = () => {
        const json: Record<string, string> = {};
        headers.forEach(({ key, value }) => {
            if (key.trim()) {
                json[key.trim()] = value.trim();
            }
        });
        return JSON.stringify(json); // Pretty JSON string
    };

    const handleBlur = async () => {
        setErrorMessage("");
        if ((selectedConnectionType === "Stdio" || selectedConnectionType === "SSE" || selectedConnectionType === "Http Streamable") && (url.trim() != "")) {
            try {
                // if (url.includes("localhost") || url.includes("127.0.0.1")) { // MCP server is local
                if (mcpServerType === "Frontend") { // MCP server is local

                    console.log("🌐 Connecting via Streamable HTTP...");

                    const SERVER_URL = new URL(url);
                    const client = new Client(
                        {
                            name: "streamable-http-demo-client",
                            version: "1.0.0",
                        },
                        { capabilities: {} }
                    );

                    const transport = new StreamableHTTPClientTransport(SERVER_URL);

                    await client.connect(transport);
                    console.log("✅ Connected.");

                    console.log("\n🔧 Listing tools:");
                    const toolsResult = await client.listTools();
                    console.log(toolsResult)


                    const extractedToolsDetail = Array.isArray(toolsResult?.tools)
                        ? toolsResult.tools.map((t: any) => ({
                            name: t?.name ?? "Unknown",
                            description: t?.description ?? "No Information",
                        }))
                        : [];
                    // setMcpDetails({"toolsDetail": extractedToolsDetail})
                    setToolsDetail(extractedToolsDetail)

                    const singleStringMcpDescription =
                        extractedToolsDetail.length === 0
                            ? "No Information."
                            : extractedToolsDetail.map((tool) => `${tool.name} - ${tool.description}`).join(". ") + ".";

                    setMcpDescription(singleStringMcpDescription)
                    setMcpDetailsLoaded(true)
                } else { // MCP server is remote
                    // const backendBaseUrl = "http://localhost:8000";
                    const res = await fetch(`${backendBaseUrl}/fetch-mcp-details?connection_type=${encodeURIComponent(selectedConnectionType)}&url=${encodeURIComponent(url)}`);
                    console.log("After fetch-mcp-details GET request", res);

                    if (!res.ok) {
                        setMcpDetailsLoaded(false);
                        setErrorMessage(
                            "No MCP details available for the given URL. Please check your URL."
                        );
                        return; // Exit early without throwing
                    }

                    const data = await res.json();

                    const toolsDetail =
                        data?.toolsDetail?.length === 0
                            ? [{ name: "No Information", description: "No Information" }]
                            : data.toolsDetail;
                    setToolsDetail(toolsDetail);
                    setMcpDescription(toolsDetail.map(tool => `${tool.name} - ${tool.description}`).join(". ") + ".")
                    setMcpDetailsLoaded(true);
                }
            }
            catch (err: any) {
                console.error("❌ Error running MCP client:", err);
                setMcpDetailsLoaded(false);
                const message = "Unable to retrieve MCP details. Please verify the URL, confirm the MCP server is running, and check the connection type before trying again.";
                setErrorMessage(`Error: ${message}`);
            }
        }
    }

    return (
        <div className={styles.Window}>
            <div className={styles.headerContainer}>
                <div className={styles.headerContent}>
                    <h2 className={styles.title}>Add MCP</h2>
                </div>
                <div className={styles.actions}>
                    <button
                        disabled={!isFormValid}
                        onClick={() => {
                            onAdd({
                                name,
                                url,
                                subAgents: [],
                                instructions: convertHeadersToJsonString(),
                                framework: "mcp",
                                description: mcpDescription,
                                type: "mcp",
                                session_id: "",
                                usage: 0,
                                metaData: {
                                    connection_type: selectedConnectionType,
                                    mcp_server_type: mcpServerType
                                },
                            });
                            setName("");
                            setUrl("");
                            setSelectedConnectionType("Select")
                            setMcpServerType("Frontend")
                            setHeaders([{ key: "", value: "" }]);
                            setMcpDetailsLoaded(false)
                        }}
                    >
                        Add
                    </button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
            <div className={styles.separator}></div>
            <div className={`${styles.inputSection} ${styles.customScrollbar}`}>
                <div className={styles.inputs}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>MCP Name<span className={styles.requiredField}>*</span></label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="e.g. My MCP"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label} htmlFor="connection-type">
                            Connection Type
                            <span className={styles.requiredField}>*</span></label>
                        <select
                            id="connection-type"
                            className={styles.input}
                            value={selectedConnectionType}
                            onChange={(e) => {
                                const newType = e.target.value;
                                // TODO : remove the following if else block when all connection types are supported, only keep the inside else part
                                if (newType === "SSE" || newType === "Stdio") {
                                    alert("The platform only support Http Streamable connection type for now!")
                                    setSelectedConnectionType(selectedConnectionType)
                                } else {
                                    setSelectedConnectionType(newType);
                                }
                            }}
                            required
                            onBlur={handleBlur}
                        >
                            {CONNECTION_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>MCP Server Type</label>
                            <div className={styles.toggleContainer}>
                                <input
                                    type="checkbox"
                                    id="modeToggle"
                                    className={styles.toggleInput}
                                    checked={mcpServerType === "Backend"}
                                    onChange={(e) => setMcpServerType(e.target.checked ? "Backend" : "Frontend")}
                                />
                                <label htmlFor="modeToggle" className={styles.toggleLabel}>
                                    <span className={`${styles.option} ${styles.frontend}`}>Frontend</span>
                                    <span className={`${styles.option} ${styles.backend}`}>Backend</span>
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>MCP URL<span className={styles.requiredField}>*</span></label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="e.g. http://localhost:1234"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onBlur={handleBlur}
                        />
                    </div>

                    <div className={styles.inputContainer}>
                        <label className={styles.label}>MCP Headers</label>
                        {headers.map((header, index) => (
                            <div key={index} className={styles.headerRow}>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Header Key"
                                    value={header.key}
                                    onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                                />
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Header Value"
                                    value={header.value}
                                    onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                                />
                                <button onClick={() => removeHeaderRow(index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#5f5f5f" width="24px" height="24px" viewBox="0 0 24.00 24.00" stroke="#5f5f5f">
                                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                        <g id="SVGRepo_iconCarrier">
                                            <path d="M19 13H5v-2h14v2z"></path>
                                        </g>
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <div className={styles.addHeaderButtonContainer}>
                            <button onClick={addHeaderRow}>
                                <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" strokeWidth="0.336">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            fillRule="evenodd" clipRule="evenodd" d="M11.25 12.75V18H12.75V12.75H18V11.25H12.75V6H11.25V11.25H6V12.75H11.25Z" fill="#5f5f5f">
                                        </path>
                                    </g>
                                </svg>
                            </button>
                        </div>
                    </div>
                    {errorMessage && <p className={styles.message}>{errorMessage}</p>}

                    {mcpDetailsLoaded && (
                        <div className={styles.inputContainer}>
                            <label className={styles.label}>MCP Details</label>
                            <div className={styles.card}>
                                <h4 className={styles.cardHeader}>MCP Tools:</h4>
                                <div>
                                    {toolsDetail.map((tool, index) => (
                                        <div key={index}>
                                            <h4 className={styles.cardHeader}>{tool.name}</h4>
                                            <p className={styles.cardContent}>{tool.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};



