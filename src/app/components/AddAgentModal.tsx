import React, { useState } from "react";
import styles from "./AddAgentModal.module.css";
import { useCopilotContext } from "@copilotkit/react-core";
import { Agent } from "./MainLayout";
const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface AgentCard {
  capabilities?: {
    extensions?: {
      params?: {
        framework?: string;
      };
      uri?: string;
    }[];
    streaming?: boolean;
  };
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
  description?: string;
  name?: string;
  preferredTransport?: string;
  protocolVersion?: string;
  url?: string;
  version?: string;
  skills?: {
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    examples?: string[];
  }[];
}

interface AddAgentModalProps {
  existingAgentNames: string[];
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
  }) => void;
  onCancel: () => void;
}

export default function AddAgentModal({ onAdd, onCancel, existingAgentNames }: AddAgentModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [agentFramework, setAgentFramework] = useState("No Information");
  const [agentDetailsLoaded, setAgentDetailsLoaded] = useState(false);
  const [agentCard, setAgentCard] = useState<AgentCard>({});
  const [errorMessage, setErrorMessage] = useState("");


  const isFormValid = name.trim() !== "" && url.trim() !== "";

  const handleBlur = async () => {
    setErrorMessage("");
    try {
      // const res = await fetch(`${url}/.well-known/agent-card.json`);
      // const backendBaseUrl = "http://localhost:8000";
      const res = await fetch(`${backendBaseUrl}/fetch-agent-card-details?url=${encodeURIComponent(url)}`);
      console.log("After fetch-agent-card-details GET request", res);


      if (!res.ok) {
        setAgentDetailsLoaded(false);
        setErrorMessage(
          "No agent details available for the given URL. Please check your URL."
        );
        return; // Exit early without throwing
      }

      const data: AgentCard = await res.json();
      setAgentCard(data);

      const framework =
        data?.capabilities?.extensions?.[0]?.params?.framework ??
        "No Information";
      setAgentFramework(framework);
      setAgentDetailsLoaded(true);
    } catch (err) {
      console.error("Failed to fetch agent card:", err);
      setAgentDetailsLoaded(false);
      setErrorMessage(
        "Unable to fetch agent details. Please verify the URL and try again."
      );
    }
  }

  return (
    <div className={styles.Window}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Add A2A Agent</h2>
        </div>
        <div className={styles.actions}>
          <button
            disabled={!isFormValid}
            onClick={() => {
              if (existingAgentNames.includes(name.trim())) {
                window.alert("Agent with given name already exist, use different name");
                return;
              }
              onAdd({
                name,
                url,
                subAgents: [],
                instructions,
                framework: agentFramework,
                description: agentCard.description ?? "",
                type: "a2a_agent",
                session_id: "",
                usage: 0,
              });
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
            <label className={styles.label}>Agent Name<span className={styles.requiredField}>*</span></label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. My Agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label}>Agent URL<span className={styles.requiredField}>*</span></label>
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
            <label className={styles.label}>Agent Instructions</label>
            <textarea
              id="system-instructions"
              className={styles.textarea}
              placeholder="System instructions for A2A Agent"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
            />
          </div>
          {errorMessage && <p className={styles.message}>{errorMessage}</p>}

          {agentDetailsLoaded && (
            <div className={styles.inputContainer}>
              <label className={styles.label}>Agent Card</label>
              <div className={styles.card}>
                <h4 className={styles.cardHeader}>Description:</h4>
                <p className={styles.cardContent}>
                  {agentCard?.description ?? "No description"}
                </p>

                <h4 className={styles.cardHeader}>Framework:</h4>
                <p className={styles.cardContent}>{agentCard?.capabilities?.extensions?.[0]?.params?.framework ?? "No Information"}</p>

                <h4 className={styles.cardHeader}>Skills:</h4>
                {agentCard?.skills?.length ? (
                  agentCard.skills.map((skill, index) => (
                    <div key={index} className={styles.skillCard}>
                      <h4 className={styles.cardHeader}>Name:</h4>
                      <p className={styles.cardContent}>{skill?.name}</p>

                      <h4 className={styles.cardHeader}>Skill Description:</h4>
                      <p className={styles.cardContent}>{skill?.description}</p>

                      <h4 className={styles.cardHeader}>Tags:</h4>
                      <div className={styles.tagContainer}>
                        {skill?.tags?.map((tag, i) => (
                          <span key={i} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h4 className={styles.cardHeader}>Examples:</h4>
                      <ul className={styles.exampleList}>
                        {skill?.examples?.map((example, i) => (
                          <li key={i}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>No skills available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
