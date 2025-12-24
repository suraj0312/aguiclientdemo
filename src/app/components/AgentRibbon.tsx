import React from "react";
import styles from "./AgentRibbon.module.css";
import { Agent } from "./MainLayout";

interface AgentRibbonProps {
  agents: Agent[];
  selectedAgentUrl: string;
  selectedAgentName: string;
  onSelectAgent: (agent: Agent) => void;
  agentType: string;
  setAgentType: (type: string) => void;
}

export default function AgentRibbon({
  agents,
  selectedAgentUrl,
  selectedAgentName,
  onSelectAgent,
  agentType,
  setAgentType,
}: AgentRibbonProps) {
  // Filter agents based on toggle
  const filteredAgents = agents.filter((agent) => agent.type === agentType);

  return (
    <div className={styles.ribbon}>
      <div className={styles.toggleGroup}>
        <input type="radio" name="mode" id="a2a_agents" value="a2a_agents" checked={agentType === "a2a_agent"} onChange={() => setAgentType("a2a_agent")} />
        <label htmlFor="a2a_agents">
          A2A Agents
        </label>

        <input
          type="radio"
          name="mode"
          id="orchestrators"
          value="orchestrator"
          checked={agentType === "orchestrator"}
          onChange={() => setAgentType("orchestrator")}
        />
        <label htmlFor="orchestrators">
          Orchestrators
        </label>

        <input
          type="radio"
          name="mode"
          id="local_agents"
          value="local_agent"
          checked={agentType === "local_agent"}
          onChange={() => setAgentType("local_agent")}
        />
        <label htmlFor="local_agents">
          Agents
        </label>
      </div>

      <div className={styles.separator}></div>

      <div className={`${styles.buttonContainer} ${styles.customScrollbar}`}>
        {filteredAgents.length > 0 ? (
          filteredAgents.map((agent) =>
            agent.type !== "mcp" ? (
              <button
                key={`${agent.name}-${agent.url}`}
                className={
                  selectedAgentUrl === agent.url &&
                    selectedAgentName === agent.name
                    ? styles.selected
                    : styles.button
                }
                onClick={() => onSelectAgent(agent)}
              >
                {agent.name}
              </button>
            ) : null
          )
        ) : (
          <p className={styles.noAgents}>No agents available</p>
        )}
      </div>
    </div>
  );
}