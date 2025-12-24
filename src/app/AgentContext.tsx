// app/agent-context.tsx
"use client";

import { createContext, useContext, useState } from "react";

const AgentContext = createContext<any>(null);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agentName, setAgentName] = useState("default-agent");

  return (
    <AgentContext.Provider value={{ agentName, setAgentName }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  return useContext(AgentContext);
}
