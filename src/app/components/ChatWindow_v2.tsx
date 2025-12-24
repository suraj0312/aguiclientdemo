



"use-client"
import React, { useEffect, useState } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import styles from "./ChatWindow.module.css";
import "@copilotkit/react-ui/styles.css";
import { useFrontendTool, useCopilotChat, CopilotKit } from "@copilotkit/react-core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";

// Import the Agent interface from MainLayout
import { Agent } from "./MainLayout";

interface ChatWindowProps {
  selectedAgentName: string;
  selectedAgentDescription: string;
  agents: Agent[];
  runtimeUrl?: string;
}

interface ToolWithClient {
  tool: any;
  client: Client;
}

// Wrapper component so we can safely use useCopilotChat inside CopilotKit provider
interface ChatWithErrorMessageProps {
  selectedAgentName: string;
  selectedAgentDescription: string;
}

function MCPTool({ tool, client }: ToolWithClient) {
  // You can use appendMessage here if you ever want to push tool results into chat
  const { appendMessage } = useCopilotChat();

  // Keep the tool prefixing logic to prevent name collisions
  const originalToolName = tool.name.split("__").pop();

  useFrontendTool({
    name: tool.name, // Use the full prefixed name for CopilotKit
    description: tool.description,
    parameters: Object.keys(tool.inputSchema.properties || {}).map((key) => ({
      name: key,
      type: tool.inputSchema.properties[key]?.type,
      description: key,
      required: Array.isArray(tool.inputSchema?.required)
        ? tool.inputSchema.required.includes(key)
        : false,
    })),
    handler: async (args) => {
      console.log("Tool Name:", tool.name);
      console.log("Args:", args);

      try {
        const result = await client.callTool(
          {
            name: originalToolName!, // Pass the original tool name to the correct MCP client
            arguments: args,
          },
          undefined,
          { timeout: 120000 }
        );

        console.log("\n✅ Tool result:");
        console.log(JSON.stringify(result, null, 2));

        return { status: "success", message: result };
      } catch (error) {
        console.error(`❌ MCP tool call failed for ${tool.name}:`, error);

        // Graceful fallback result – no exception bubbles up into CopilotKit
        return {
          status: "error",
          message:
            "The external MCP server for this tool is currently unavailable. " +
            "I’ll continue without this tool.",
        };
      }

      // If you want to emit the result into the chat later, you can use:
      // appendMessage(
      //   new TextMessage({
      //     role: MessageRole.Assistant,
      //     content: tool_result,
      //   }),
      //   { followUp: false }
      // );
    },
  });

  return null;
}

/** ------------------------------
 * Helpers to keep the logic simple
 * ------------------------------ */

// Treat only MCP subagents with expected Frontend type as valid
const isLocalMcp = (subAgent: any) =>
  subAgent?.type === "mcp" &&
  typeof subAgent?.url === "string" &&
  subAgent?.metaData?.mcp_server_type === "Frontend";

// Sanitize tool name to meet Vertex AI requirements and avoid collisions
const sanitizePrefixedToolName = (prefix: string, toolName: string) => {
  const rawPrefixedName = `${prefix}__${toolName}`;
  let sanitizedName = rawPrefixedName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  if (!/^[a-zA-Z_]/.test(sanitizedName)) {
    sanitizedName = `_${sanitizedName}`;
  }
  if (sanitizedName.length > 64) {
    sanitizedName = sanitizedName.slice(0, 64);
  }
  return sanitizedName;
};

/**
 * Collect MCP subagents based on selected agent type, with de-duplication:
 * - local_agent → its direct MCP subAgents (deduped)
 * - orchestrator → for each local_agent subAgent, collect its MCP subAgents (deduped)
 */
const collectLocalMcpSubagents = (selectedAgent: any): any[] => {
  if (!selectedAgent) return [];

  // Stable uniqueness key per MCP subagent: prefer URL (connection endpoint)
  const uniqueKeyFor = (agent: any) =>
    (typeof agent?.url === "string" && agent.url) ||
    (typeof agent?.name === "string" && agent.name) ||
    `${agent?.type ?? "unknown"}:${agent?.url ?? ""}`;

  // LOCAL AGENT: return its MCP subAgents, deduped
  if (selectedAgent.type === "local_agent") {
    const nested = (selectedAgent.subAgents ?? []).filter(isLocalMcp);
    const seen = new Set<string>();
    const deduped: any[] = [];
    for (const agent of nested) {
      const key = uniqueKeyFor(agent);
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(agent);
      }
    }
    return deduped;
  }

  // ORCHESTRATOR: for each local_agent under orchestrator, expose its MCP subAgents, deduped
  if (selectedAgent.type === "orchestrator") {
    const mcpSubagents: any[] = [];
    const seen = new Set<string>();

    for (const sub of selectedAgent.subAgents ?? []) {
      if (sub?.type === "local_agent") {
        const nested = (sub.subAgents ?? []).filter(isLocalMcp);

        for (const agent of nested) {
          const key = uniqueKeyFor(agent);
          if (!seen.has(key)) {
            seen.add(key);
            mcpSubagents.push(agent);
          }
        }
      }
    }
    return mcpSubagents;
  }

  // Any other agent type: no MCP exposure
  return [];
};



const ChatWithErrorMessage: React.FC<ChatWithErrorMessageProps> = ({
  selectedAgentName,
  selectedAgentDescription,
}) => {
  const { appendMessage } = useCopilotChat();

  return (
    <CopilotChat
      labels={{
        title: "Chat Assistant",
        initial: `Hi! I'm connected to **${selectedAgentName}** - ${selectedAgentDescription}. How can I help?`,
      }}
      imageUploadsEnabled={true}
      inputFileAccept="*/*"
      onError={(error) => {
        console.error("💥 CopilotChat error:", error);

        // Optional: also show a browser alert
        alert(
          "The agent had trouble completing your request (possibly MCP is down). " +
            "You can still keep chatting, but some actions may not work."
        );
        // ✅ Show a clear error message inside the chat
        appendMessage(
          new TextMessage({
            role: MessageRole.Assistant,
            content:
              "⚠️ **I encountered an error while processing your request.**\n\n" +
              "This usually happens when a connected tool or MCP server is offline.\n" +
              "You cannot continue chatting, untill MCP server is online",
          }),
          { followUp: false }
        );
      }}
    />
  );
};

export default function ChatWindow({
  selectedAgentName,
  selectedAgentDescription,
  agents,
  runtimeUrl,
}: ChatWindowProps) {
  const [toolsWithClients, setToolsWithClients] = useState<ToolWithClient[]>([]);

  useEffect(() => {
    const selectedAgent = agents.find((a) => a.name === selectedAgentName);

    if (!selectedAgent) {
      setToolsWithClients([]);
      return;
    }

    // Collect MCP subagents depending on agent type (deduped)
    const mcpSubagents = collectLocalMcpSubagents(selectedAgent);

    const fetchMcpTools = async () => {
      const allToolsWithClients: ToolWithClient[] = [];

      for (const subAgent of mcpSubagents) {
        try {
          const client = new Client(
            {
              name: `${subAgent.name}-client`,
              version: "1.0.0",
            },
            {
              capabilities: {},
            }
          );

          const SERVER_URL = new URL(subAgent.url);
          const transport = new StreamableHTTPClientTransport(SERVER_URL, {});
          await client.connect(transport, { timeout: 120000 });
          console.log(`✅ Connected to MCP server at ${subAgent.url}.`);

          const toolsResult = await client.listTools();
          console.log("Available tool lists are: ", toolsResult);

          const toolsForSubagent = toolsResult.tools.map((tool: any) => {
            const sanitizedName = sanitizePrefixedToolName(
              subAgent.name,
              tool.name
            );

            return {
              tool: {
                ...tool,
                name: sanitizedName,
                description: `Tool from ${subAgent.name}: ${tool.description}`,
              },
              client,
            };
          });

          allToolsWithClients.push(...toolsForSubagent);
        } catch (error) {
          console.error(
            `❌ Failed to connect or list tools for ${subAgent.url}:`,
            error
          );
        }
      }

      setToolsWithClients(allToolsWithClients);
    };

    fetchMcpTools();
  }, [selectedAgentName, agents]);

  return (
    <div className={styles.chatWindow}>
      <CopilotKit
        key={selectedAgentName}
        runtimeUrl={runtimeUrl}
        agent="my_agent"
      >
        {/* Chat with in-chat error messaging */}
        <ChatWithErrorMessage
          selectedAgentName={selectedAgentName}
          selectedAgentDescription={selectedAgentDescription}
        />

        {/* Register MCP tools (if any) */}
        {toolsWithClients.map(({ tool, client }) => (
          <MCPTool key={tool.name} tool={tool} client={client} />
        ))}
      </CopilotKit>
    </div>
  );
}