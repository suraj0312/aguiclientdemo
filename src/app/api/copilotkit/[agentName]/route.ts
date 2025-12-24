import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";
const BackendUrl = process.env.BACKEND_URL;

// 1. You can use any service adapter here for multi-agent support. We use
//    the empty adapter since we're only using one agent.
const serviceAdapter = new ExperimentalEmptyAdapter();

// 2. Create the CopilotRuntime instance and utilize the PydanticAI AG-UI
//    integration to setup the connection.

export const POST = async (req: NextRequest) => {

  const agentName = req.url.split("/").pop();
  console.log("RUNTIME AGENTNAME", agentName)
  const runtime = new CopilotRuntime({
    agents: {
      // "my_agent": new HttpAgent({ url: "http://localhost:9000/orchestrator"  }),
      "my_agent": new HttpAgent({ url: `${BackendUrl}/${agentName}` }),
    }
  });

// 3. Build a Next.js API route that handles the CopilotKit runtime requests.
// export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime, 
    serviceAdapter,
    endpoint: `/api/copilotkit/${agentName}`,
  });

  return handleRequest(req);
};