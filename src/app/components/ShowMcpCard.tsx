import React, { useEffect, useState } from "react";
import styles from "./ShowAgentCard.module.css";
import { Agent } from "./MainLayout";
import { AgentCard } from "./AddAgentModal";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface ShowAgentCardProps {
    agent: Agent | null;
    onBack: () => void;
}

interface McpDetails {
    toolDetails: { name: string, description: string }[]
}

export default function ShowMcpCard({ agent, onBack }: ShowAgentCardProps) {
    // const [agentCard, setAgentCard] = useState<AgentCard | null>(null);
    // const [agentDetailsLoaded, setAgentDetailsLoaded] = useState(false);
    const [toolsDetail, setToolsDetail] = useState<{ name: string, description: string }[]>([]);
    const [mcpDetailsLoaded, setMcpDetailsLoaded] = useState(false);
    // const [mcpDetails, setMcpDetails] = useState<McpDetails>({ toolsDetail: [] });
    const [errorMessage, setErrorMessage] = useState("");
    const [mcpDescription, setMcpDescription] = useState("")


    useEffect(() => {
        const getAgentCard = async () => {
            if (!agent?.url) return;

            setErrorMessage("");
            try {
                // if (agent?.url.includes("localhost") || agent?.url.includes("127.0.0.1")) { // MCP server is local
                if (agent?.metaData?.mcp_server_type === "Frontend") { // MCP server is local

                    console.log("🌐 Connecting via Streamable HTTP...");

                    const SERVER_URL = new URL(agent?.url);
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
                    const res = await fetch(`${backendBaseUrl}/fetch-mcp-details?connection_type=${encodeURIComponent(agent?.metaData?.connection_type)}&url=${encodeURIComponent(agent?.url)}`);
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
        };

        getAgentCard();
    }, [agent]);

    return (
        <div className={styles.Window}>
            <div className={styles.headerContainer}>
                <div className={styles.headerContent}>
                    <h2 className={styles.title}>MCP Details</h2>
                </div>
                <div className={styles.actions}>
                    <button onClick={onBack}>Back</button>
                </div>
            </div>

            <div className={styles.separator}></div>
            <div className={`${styles.inputSection} ${styles.customScrollbar}`}>
                {/* <label className={styles.label}>Agent Card</label> */}
                {errorMessage && <p className={styles.message}>{errorMessage}</p>}

                {mcpDetailsLoaded && (
                    <div className={styles.inputContainer}>
                        <div className={styles.card}>
                            <h4 className={styles.cardHeader}>Name:</h4>
                            <p className={styles.cardContent}>
                                {agent?.name ?? "No name"}
                            </p>
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
    );
}