import React, { useState } from "react";
import styles from "./CreateLocalAgentForm.module.css";
import { useCopilotContext } from "@copilotkit/react-core";
import AgGridTable from "./AgGridTable";
import { Agent } from "./MainLayout";
import { LLM_TYPES, DEFAULT_LLM_CONFIGS, LLMType } from "./LlmConfigs";

// --- START: External/Helper Functions for Consistency ---

/**
 * Parses a multi-line key=value string into a trimmed, validated object.
 * This function is used everywhere to ensure consistent parsing.
 */
const parseConfigString = (configString: string): Record<string, string> => {
  const lines = configString.split('\n');
  const configObj: Record<string, string> = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue; // Skip empty lines

    const parts = trimmedLine.split('=');

    // Check for the '=' delimiter and ensure it's not just a key with no value
    if (parts.length >= 2) {
      // Key is the first part, value is the rest joined by '=' (in case value has '=')
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();

      // We only strictly require a key, the value might be empty but present
      if (key) {
        configObj[key] = value;
      }
    }
  }
  return configObj;
};

/**
 * Validates the parsed config object against the default expected keys.
 * Ensures no key names are modified/added, and all required keys are present.
 */
const validateLLMConfig = (
  configString: string,
  llmType: LLMType
): { isValid: boolean, errorType?: 'key_mismatch' | 'missing_value' | 'missing_key' | 'format_error' } => {
  const currentConfigString = DEFAULT_LLM_CONFIGS[llmType];
  const requiredKeys = new Set(Object.keys(parseConfigString(currentConfigString)));

  const configObj = parseConfigString(configString);
  const userKeys = new Set(Object.keys(configObj));

  // 1. Check for modified/extra keys (key_mismatch)
  for (const userKey of userKeys) {
    if (!requiredKeys.has(userKey)) {
      return { isValid: false, errorType: 'key_mismatch' };
    }
  }

  // 2. Check for missing required keys (missing_key)
  for (const requiredKey of requiredKeys) {
    if (!userKeys.has(requiredKey)) {
      return { isValid: false, errorType: 'missing_key' };
    }
    // 3. Check for values (missing_value). A value must be present, even if empty string.
    if (configObj[requiredKey] === undefined) {
      return { isValid: false, errorType: 'missing_value' };
    }
  }

  // 4. Check for basic format failure (if any line has no '=')
  const lines = configString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  for (const line of lines) {
    if (line.indexOf('=') === -1) {
      return { isValid: false, errorType: 'format_error' };
    }
  }

  return { isValid: userKeys.size > 0, errorType: undefined };
};

// --- END: External/Helper Functions ---


interface CreateLocalAgentFormProps {
  agents: Agent[];
  onCreate: (agent: {
    name: string;
    url: string;
    subAgents: Agent[];
    instructions: string;
    framework: string;
    description: string;
    type: string;
    session_id: string;
    usage: number;
    metaData?: Record<string, any>;
  }) => void;
  onCancel: () => void;
}

export default function CreateLocalAgentForm({
  agents,
  onCreate,
  onCancel,
}: CreateLocalAgentFormProps) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState(`You are an AI agent.
You can call tools. Use them automatically to answer questions accurately.
Always reply in clear, human-readable language. Use simple words, short sentences, and clean formatting.
Understand the user's intent before responding.`);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  // const threadId = useCopilotContext().threadId;

  const selectedAgents = agents.filter((a) =>
    selected.includes(a.name + a.url)
  );

  const [selectedLLMType, setSelectedLLMType] = useState<LLMType>("Azure OpenAI");
  const [llmConfig, setLLMConfig] = useState(DEFAULT_LLM_CONFIGS["Azure OpenAI"]);
  const [llmMaxCall, setLLMMaxCall] = useState("50")

  // We rely on the detailed validation check now
  const { isValid: isLLMConfigValid } = validateLLMConfig(llmConfig, selectedLLMType);
  // const isFormValid = name.trim() && instructions.trim() && description.trim() && isLLMConfigValid;
  const isFormValid = name.trim() && instructions.trim() && isLLMConfigValid;

  // --- START: Agent Name Validation Logic ---
  const handleNameChange = (newName: string) => {
    // Only allow letters, numbers, spaces, and underscores
    const invalidCharRegex = /[^a-zA-Z0-9_\s]/;

    if (invalidCharRegex.test(newName)) {
      window.alert("Local agent name cannot have special characters except underscores (_).");
    } else {
      setName(newName);
    }
  };
  // --- END: Agent Name Validation Logic ---


  // --- START: LLM Config Validation & Submission Logic ---
  const handleLLMConfigBlur = () => {
    const validation = validateLLMConfig(llmConfig, selectedLLMType);

    if (!validation.isValid) {
      let alertMessage = "🚨 LLM Configuration Error: ";

      switch (validation.errorType) {
        case 'key_mismatch':
          alertMessage += "You cannot change, add, or delete key names (e.g., API_KEY). Only modify the values after the equals sign.";
          break;
        case 'missing_key':
          alertMessage += "All required key-value pairs from the default configuration must be present.";
          break;
        case 'format_error':
          alertMessage += "Each configuration setting must be in a 'KEY=VALUE' format on its own line.";
          break;
        case 'missing_value':
          alertMessage += "All keys must have an associated value (even if it's an empty string) and cannot be left as just 'KEY='.";
          break;
        default:
          alertMessage += "Please ensure the format is correct (KEY=VALUE) and all required fields are filled.";
          break;
      }

      window.alert(alertMessage);
      setLLMConfig(DEFAULT_LLM_CONFIGS[selectedLLMType]); // Reset to default on error
      return;
    }
  };

  const isNumericString = () => {
    const num = parseFloat(llmMaxCall)
    const is_number = !isNaN(num) && isFinite(num) && /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(llmMaxCall)
    if (is_number) {
      setLLMMaxCall(llmMaxCall)
    } else {
      alert("Maximum LLM Call should be a valid number")
      setLLMMaxCall("50")
    }
  }

  const handleCreate = () => {
    const validation = validateLLMConfig(llmConfig, selectedLLMType);

    if (!validation.isValid) {
      // Rerun the blur handler logic to show the specific error
      handleLLMConfigBlur();
      return;
    }

    // Parse the final, validated configuration
    const configObj = parseConfigString(llmConfig);

    onCreate({
      name,
      url: "",
      subAgents: selectedAgents,
      instructions,
      framework: "",
      description: "",
      type: "local_agent",
      session_id: "",
      usage: 0,
      metaData: {
        llmType: selectedLLMType,
        llmConfig: configObj,
        llmMaxCall: llmMaxCall,
      }
    });
  };
  // --- END: LLM Config Validation & Submission Logic ---


  return (
    <div className={styles.Window}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Create Agent</h2>
        </div>
        <div className={styles.actions}>
          <button
            disabled={!isFormValid}
            onClick={handleCreate}
          >
            Create
          </button>
          <button onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      <div className={styles.separator} />

      <div className={`${styles.inputSection} ${styles.customScrollbar}`}>
        <div className={styles.inputs}>
          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="llm-type">
              LLM Type
              <span className={styles.requiredField}>*</span>
            </label>
            <select
              id="llm-type"
              className={styles.input}
              value={selectedLLMType}
              onChange={(e) => {
                const newType = e.target.value as LLMType;
                setSelectedLLMType(newType);
                setLLMConfig(DEFAULT_LLM_CONFIGS[newType]); // Reset config to default on type change
              }}
              required
            >
              {LLM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="llm-config">
              LLM Configuration
            </label>
            <textarea
              id="llm-config"
              className={styles.textarea}
              value={llmConfig}
              onChange={(e) => setLLMConfig(e.target.value)}
              onBlur={handleLLMConfigBlur} // Use the specific handler
              rows={6}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="agent-name">
              Local Agent Name
              <span className={styles.requiredField}>*</span>
            </label>
            <input
              id="agent-name"
              className={styles.input}
              type="text"
              placeholder="e.g. My Local Agent"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)} // Use the dedicated handler
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="agent-instructions">
              System Instructions
                <span className={styles.requiredField}>*</span>
            </label>
            <textarea
              id="agent-instructions"
              className={styles.textarea}
              placeholder="Agent instruction to perform tasks."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              required
            />
          </div>

          {/* <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="agent-description">
              Agent Description
                <span className={styles.requiredField}>*</span>
            </label>
            <textarea
              id="agent-description"
              className={styles.textarea}
              placeholder="Agent description."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div> */}

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="agent-name">
              Maximum LLM Call
              <span className={styles.requiredField}>*</span>
            </label>
            <input
              id="agent-name"
              className={styles.input}
              type="text"
              placeholder="e.g. 20"
              value={llmMaxCall}
              onChange={(e) => setLLMMaxCall(e.target.value)}
              onBlur={isNumericString}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label}>Select MCPs</label>
            <div className={styles.tableContainer}>
              <AgGridTable
                agents={agents.filter((a) => a.type === "mcp")}
                selected={selected}
                setSelected={setSelected}
              />
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
}

