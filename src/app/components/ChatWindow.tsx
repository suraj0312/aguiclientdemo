// // import React, { useEffect, useState } from "react";
// // import { CopilotChat } from "@copilotkit/react-ui";
// // import styles from "./ChatWindow.module.css";
// // import "@copilotkit/react-ui/styles.css";
// // import { useFrontendTool, useCopilotChat } from "@copilotkit/react-core";
// // import { Client } from "@modelcontextprotocol/sdk/client/index.js";
// // import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
// // import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
// // import { CopilotKit } from "@copilotkit/react-core"; 

// // // Import the Agent interface from MainLayout
// // import { Agent } from "./MainLayout";
 
// // interface ChatWindowProps {
// //   selectedAgentName: string;
// //   selectedAgentDescription: string;
// //   agents: Agent[];
// //   runtimeUrl?: string;
// // }
 
// // interface ToolWithClient {
// //   tool: any;
// //   client: Client;
// // }
 
// // function MCPTool({ tool, client }: ToolWithClient) {
// //   const { appendMessage } = useCopilotChat();
  
// //   // Keep the tool prefixing logic to prevent name collisions
// //   const originalToolName = tool.name.split("__").pop();
 
// //   useFrontendTool({
// //     name: tool.name, // Use the full prefixed name for CopilotKit
// //     description: tool.description,
// //     parameters: Object.keys(tool.inputSchema.properties).map((key) => ({
// //       name: key,
// //       type: tool.inputSchema.properties[key].type,
// //       description: key,
// //       required: Array.isArray(tool.inputSchema.required)
// //                ? tool.inputSchema.required.includes(key)
// //                : false,
// //     })),
// //     handler: async (args) => {
// //       console.log(args)
// //       const result = await client.callTool({
// //         name: originalToolName, // Pass the original tool name to the correct MCP client
// //         arguments: args,
// //       });
// //       console.log("\n✅ Tool result:");
// //       const tool_result = JSON.stringify(result, null, 2);
// //       console.log(tool_result);
// //       return {status:"success",message:result}
// //       // appendMessage(
// //       //   new TextMessage({
// //       //     role: MessageRole.Assistant,
// //       //     content: tool_result,
// //       //   }),
// //       //   { followUp: false }
// //       // );
// //     },
// //   });
// //   return null;
// // }
 
// // // ... imports and MCPTool component remain the same ...
 
// // export default function ChatWindow({ selectedAgentName, selectedAgentDescription, agents, runtimeUrl }: ChatWindowProps) {
// //   const [toolsWithClients, setToolsWithClients] = useState<ToolWithClient[]>([]);
 
// //   useEffect(() => {
// //     const selectedAgent = agents.find(agent => agent.name === selectedAgentName);
 
// //     if (!selectedAgent || !selectedAgent.subAgents) {
// //       setToolsWithClients([]);
// //       return;
// //     }
 
// //     const mcpSubagents = selectedAgent.subAgents.filter(subAgent =>
// //       subAgent.type === "mcp" &&
// //       (subAgent.url.includes("localhost") ||
// //        subAgent.url.includes("127.0.0.1"))
// //     );
 
// //     const fetchMcpTools = async () => {
// //       const allToolsWithClients: ToolWithClient[] = [];
 
// //       for (const subAgent of mcpSubagents) {
// //         try {
// //           const client = new Client(
// //             {
// //               name: `${subAgent.name}-client`,
// //               version: "1.0.0",
// //             },
// //             {
// //               capabilities: {},
// //             }
// //           );
 
// //           const SERVER_URL = new URL(subAgent.url);
// //           const transport = new StreamableHTTPClientTransport(SERVER_URL, {});
// //           await client.connect(transport);
// //           console.log(`✅ Connected to MCP server at ${subAgent.url}.`);
 
// //           const toolsResult = await client.listTools();
 
// //           const toolsForSubagent = toolsResult.tools.map(tool => {
// //             // 🆕 Step 1: Sanitize the prefixed tool name to meet Vertex AI requirements.
// //             const rawPrefixedName = `${subAgent.name}__${tool.name}`;
            
// //             // Replace any invalid characters with an underscore
// //             let sanitizedName = rawPrefixedName.replace(/[^a-zA-Z0-9_.-]/g, '_');
            
// //             // Ensure the name starts with a letter or underscore
// //             if (!/^[a-zA-Z_]/.test(sanitizedName)) {
// //               sanitizedName = `_${sanitizedName}`;
// //             }
 
// //             // Enforce max length of 64 characters
// //             if (sanitizedName.length > 64) {
// //               sanitizedName = sanitizedName.slice(0, 64);
// //             }
 
// //             return {
// //               tool: {
// //                 ...tool,
// //                 name: sanitizedName,
// //                 description: `Tool from ${subAgent.name}: ${tool.description}`,
// //               },
// //               client: client,
// //             };
// //           });
 
// //           allToolsWithClients.push(...toolsForSubagent);
// //           // await transport.terminateSession();
// //           // console.log("🧹 Session terminated.");
// //         } catch (error) {
// //           console.error(`❌ Failed to connect or list tools for ${subAgent.url}:`, error);
// //         }
// //       }
// //       setToolsWithClients(allToolsWithClients);
// //     };
 
// //     fetchMcpTools();
 
// //   }, [selectedAgentName, agents]);
 
// //   return (
// //     <div className={styles.chatWindow}>
// //       <CopilotKit
// //         key={selectedAgentName}
// //         runtimeUrl={runtimeUrl}
// //         agent="my_agent"
// //       >
// //       <CopilotChat
// //         labels={{
// //           title: "Chat Assistant",
// //           initial: `Hi! I'm connected to **${selectedAgentName}** - ${selectedAgentDescription}. How can I help?`,
// //         }}
// //       />
// //       {toolsWithClients.map(({ tool, client }) => (
// //         <MCPTool key={tool.name} tool={tool} client={client} />
// //       ))}
// //       </CopilotKit>
// //     </div>
// //   );
// // }


// import React, { useEffect, useState } from "react";
// import { CopilotChat } from "@copilotkit/react-ui";
// import styles from "./ChatWindow.module.css";
// import "@copilotkit/react-ui/styles.css";
// import { useFrontendTool, useCopilotChat } from "@copilotkit/react-core";
// import { Client } from "@modelcontextprotocol/sdk/client/index.js";
// import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
// import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
// import { CopilotKit } from "@copilotkit/react-core";

// // Import the Agent interface from MainLayout
// import { Agent } from "./MainLayout";

// interface ChatWindowProps {
//   selectedAgentName: string;
//   selectedAgentDescription: string;
//   agents: Agent[];
//   runtimeUrl?: string;
// }

// interface ToolWithClient {
//   tool: any;
//   client: Client;
// }

// function MCPTool({ tool, client }: ToolWithClient) {
//   const { appendMessage } = useCopilotChat();

//   // Keep the tool prefixing logic to prevent name collisions
//   const originalToolName = tool.name.split("__").pop();

//   useFrontendTool({
//     name: tool.name, // Use the full prefixed name for CopilotKit
//     description: tool.description,
//     parameters: Object.keys(tool.inputSchema.properties).map((key) => ({
//       name: key,
//       type: tool.inputSchema.properties[key].type,
//       description: key,
//       required: Array.isArray(tool.inputSchema.required)
//         ? tool.inputSchema.required.includes(key)
//         : false,
//     })),
//     handler: async (args) => {
//       console.log(args);
//       const result = await client.callTool({
//         name: originalToolName, // Pass the original tool name to the correct MCP client
//         arguments: args,
//       });
//       console.log("\n✅ Tool result:");
//       const tool_result = JSON.stringify(result, null, 2);
//       console.log(tool_result);
//       return { status: "success", message: result };
//       // appendMessage(
//       //   new TextMessage({
//       //     role: MessageRole.Assistant,
//       //     content: tool_result,
//       //   }),
//       //   { followUp: false }
//       // );
//     },
//   });
//   return null;
// }

// /** ------------------------------
//  * Helpers to keep the logic simple
//  * ------------------------------ */

// // Treat only localhost / 127.0.0.1 MCP subagents as valid
// const isLocalMcp = (subAgent: any) =>
//   subAgent?.type === "mcp" &&
//   typeof subAgent?.url === "string" &&
//   (subAgent.metaData.mcp_server_type === "Frontend");
//   // (subAgent.url.includes("localhost") || subAgent.url.includes("127.0.0.1"));

// // Sanitize tool name to meet Vertex AI requirements and avoid collisions
// const sanitizePrefixedToolName = (prefix: string, toolName: string) => {
//   const rawPrefixedName = `${prefix}__${toolName}`;
//   let sanitizedName = rawPrefixedName.replace(/[^a-zA-Z0-9_.-]/g, "_");
//   if (!/^[a-zA-Z_]/.test(sanitizedName)) {
//     sanitizedName = `_${sanitizedName}`;
//   }
//   if (sanitizedName.length > 64) {
//     sanitizedName = sanitizedName.slice(0, 64);
//   }
//   return sanitizedName;
// };

// // Collect MCP subagents based on selected agent type:
// // - local_agent → its direct MCP subAgents
// // - orchestrator → for each local_agent subAgent, collect its MCP subAgents
// const collectLocalMcpSubagents = (selectedAgent: any): any[] => {
//   if (!selectedAgent) return [];

//   if (selectedAgent.type === "local_agent") {
//     // Current behavior: expose MCP tools from this local_agent
//     return (selectedAgent.subAgents || []).filter(isLocalMcp);
//   }

//   if (selectedAgent.type === "orchestrator") {
//     // New behavior: for each local_agent under orchestrator, expose its MCP subAgents
//     const mcpSubagents: any[] = [];
//     for (const sub of selectedAgent.subAgents || []) {
//       if (sub?.type === "local_agent") {
//         const nested = (sub.subAgents || []).filter(isLocalMcp);
//         mcpSubagents.push(...nested);
//       }
//     }
//     return mcpSubagents;
//   }

//   // Any other agent type: no MCP exposure
//   return [];
// };

// export default function ChatWindow({
//   selectedAgentName,
//   selectedAgentDescription,
//   agents,
//   runtimeUrl,
// }: ChatWindowProps) {
//   const [toolsWithClients, setToolsWithClients] = useState<ToolWithClient[]>([]);

//   useEffect(() => {
//     const selectedAgent = agents.find((a) => a.name === selectedAgentName);

//     if (!selectedAgent) {
//       setToolsWithClients([]);
//       return;
//     }

//     // Collect MCP subagents depending on agent type
//     const mcpSubagents = collectLocalMcpSubagents(selectedAgent);

//     const fetchMcpTools = async () => {
//       const allToolsWithClients: ToolWithClient[] = [];

//       for (const subAgent of mcpSubagents) {
//         try {
//           const client = new Client(
//             {
//               name: `${subAgent.name}-client`,
//               version: "1.0.0",
//             },
//             {
//               capabilities: {},
//             }
//           );

//           const SERVER_URL = new URL(subAgent.url);
//           const transport = new StreamableHTTPClientTransport(SERVER_URL, {});
//           await client.connect(transport, {timeout : 120000});
//           console.log(`✅ Connected to MCP server at ${subAgent.url}.`);

//           const toolsResult = await client.listTools();

//           const toolsForSubagent = toolsResult.tools.map((tool: any) => {
//             const sanitizedName = sanitizePrefixedToolName(subAgent.name, tool.name);

//             return {
//               tool: {
//                 ...tool,
//                 name: sanitizedName,
//                 description: `Tool from ${subAgent.name}: ${tool.description}`,
//               },
//               client,
//             };
//           });

//           allToolsWithClients.push(...toolsForSubagent);
//           // Optional: end session after fetching tools
//           // await transport.terminateSession();
//           // console.log("🧹 Session terminated.");
//         } catch (error) {
//           console.error(`❌ Failed to connect or list tools for ${subAgent.url}:`, error);
//         }
//       }

//       setToolsWithClients(allToolsWithClients);
//     };

//     fetchMcpTools();
//   }, [selectedAgentName, agents]);

//   return (
//     <div className={styles.chatWindow}>
//       <CopilotKit key={selectedAgentName} runtimeUrl={runtimeUrl} agent="my_agent">
//         <CopilotChat
//           labels={{
//             title: "Chat Assistant",
//             initial: `Hi! I'm connected to **${selectedAgentName}** - ${selectedAgentDescription}. How can I help?`,
//           }}
//           imageUploadsEnabled={true}
//           inputFileAccept="*/*"
//         />
//         {toolsWithClients.map(({ tool, client }) => (
//           <MCPTool key={tool.name} tool={tool} client={client} />
//         ))}
//       </CopilotKit>
//     </div>
//   );
// }


// ChatWindow.tsx
"use client"
import React, { useEffect, useState } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import styles from "./ChatWindow.module.css";
import "@copilotkit/react-ui/styles.css";
import { useFrontendTool, useCopilotChat } from "@copilotkit/react-core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { CopilotKit } from "@copilotkit/react-core";
 
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
 
function MCPTool({ tool, client }: ToolWithClient) {
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
      console.log("Tool Name - ", tool.name);
      console.log("Tool Args - ", args);
      const result = await client.callTool(
        {
          name: originalToolName!, // Pass the original tool name to the correct MCP client
          arguments: args,
        },
        undefined,
        { timeout: 120000 }
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log("\n✅ Tool result:");
      const tool_result = JSON.stringify(result, null, 2);
      console.log(tool_result);
      return { status: "success", message: result };
      // If you want to emit the result into the chat:
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
// If you need to constrain to localhost:
// (subAgent.url.includes("localhost") || subAgent.url.includes("127.0.0.1"))
 
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
          console.log(`Available tools for MCP ${subAgent.url}: `, toolsResult)
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
          // Optional: end session after fetching tools
          // await transport.terminateSession();
          // console.log("🧹 Session terminated.");
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
      <CopilotKit key={selectedAgentName} runtimeUrl={runtimeUrl} agent="my_agent">
        <CopilotChat
          labels={{
            title: "Chat Assistant",
            initial: `Hi! I'm connected to **${selectedAgentName}**${selectedAgentDescription}. How can I help?`,
          }}
          imageUploadsEnabled={true}
          inputFileAccept="*/*"
        />
        {toolsWithClients.map(({ tool, client }) => (
          <MCPTool key={tool.name} tool={tool} client={client} />
        ))}
      </CopilotKit>
    </div>
  );
}