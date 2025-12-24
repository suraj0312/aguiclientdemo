import React, { useState } from "react";
import AgGridTable from "./AgGridTable";
import styles from "./EditOrchestratorForm.module.css";
import { Agent } from "./MainLayout";


interface EditOrchestratorFormProps {
  // orchestrator: Orchestrator;
  orchestrator: Agent;
  agents: Agent[];
  onUpdate: (updatedOrchestrator: Agent) => void;
  onBack: () => void;
}

export default function EditOrchestratorForm({
  orchestrator,
  agents,
  onUpdate,
  onBack,
}: EditOrchestratorFormProps) {
  const [name, setName] = useState(orchestrator.name);
  const [instructions, setInstructions] = useState(orchestrator.instructions);
  const [description, setDescription] = useState(orchestrator.description);
  const [selected, setSelected] = useState<string[]>(
    (orchestrator.subAgents ?? []).map((a) => a.name + a.url)
  );

  const selectedAgents = agents.filter((a) => selected.includes(a.name + a.url));
  const isFormValid = instructions?.trim() && description.trim();

  return (
    <div className={styles.Window}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Edit Orchestrator Details</h2>
        </div>
        <div className={styles.actions}>
          <button
          disabled={!isFormValid}
            onClick={() =>
              onUpdate({
                ...orchestrator,
                name,
                instructions,
                description,
                subAgents: selectedAgents,
              })
            }
          >
            Update
          </button>
          <button onClick={onBack}>Back</button>
        </div>
      </div>

      <div className={styles.separator}></div>

      <div className={`${styles.inputSection} ${styles.customScrollbar}`}>
        <div className={styles.inputs}>
          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="orchestrator-name">
              Orchestrator Name
            </label>
            <input
              id="orchestrator-name"
              className={styles.input}
              type="text"
              placeholder="e.g. My Orchestrator Agent"
              value={name}
              disabled
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="orchestrator-instructions">
              System Instructions
              <span className={styles.requiredField}>*</span>
            </label>
            <textarea
              id="orchestrator-instructions"
              className={styles.textarea}
              placeholder="Supervisor instruction for managing multiple agents"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="orchestrator-description">
              Orchestrator Description
              <span className={styles.requiredField}>*</span>
            </label>
            <textarea
              id="orchestrator-description"
              className={styles.textarea}
              placeholder="Orchestrator description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label}>
              Selected Agents
            </label>
            <div className={styles.tableContainer}>
              <AgGridTable
                agents={agents.filter((a) => a.type === "a2a_agent" || a.type === "local_agent")}
                selected={selected}
                setSelected={setSelected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}