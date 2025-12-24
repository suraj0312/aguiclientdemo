import React, { useEffect, useState } from "react";
import styles from "./ShowAgentCard.module.css";
import { Agent } from "./MainLayout";
import { AgentCard } from "./AddAgentModal";

interface ShowAgentCardProps {
    agent: Agent | null;
    onBack: () => void;
}

export default function ShowAgentCard({ agent, onBack }: ShowAgentCardProps) {
    const [agentCard, setAgentCard] = useState<AgentCard | null>(null);
    const [agentDetailsLoaded, setAgentDetailsLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const getAgentCard = async () => {
            if (!agent?.url) return;

            setErrorMessage("");
            try {
                // const backendBaseUrl = "http://localhost:8000";
                const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                const res = await fetch(
                    `${backendBaseUrl}/fetch-agent-card-details?url=${encodeURIComponent(agent.url)}`
                );
                console.log("After fetch-agent-card-details GET request", res);

                if (!res.ok) {
                    setErrorMessage(
                        `No agent details available for the given Agent: ${agent?.name}. Please check if the agent is active.`
                    );
                    return;
                }

                const data: AgentCard = await res.json();
                setAgentCard(data);
                setAgentDetailsLoaded(true);
            } catch (err) {
                console.error("Failed to fetch agent card:", err);
                setAgentDetailsLoaded(false);
                setErrorMessage(
                    "Unable to fetch agent details. Please verify the URL and try again."
                );
            }
        };

        getAgentCard();
    }, [agent]);

    return (
        <div className={styles.Window}>
            <div className={styles.headerContainer}>
                <div className={styles.headerContent}>
                    <h2 className={styles.title}>Agent Card</h2>
                </div>
                <div className={styles.actions}>
                    <button onClick={onBack}>Back</button>
                </div>
            </div>

            <div className={styles.separator}></div>
            <div className={`${styles.inputSection} ${styles.customScrollbar}`}>
                {/* <label className={styles.label}>Agent Card</label> */}
                {errorMessage && <p className={styles.message}>{errorMessage}</p>}

                {agentDetailsLoaded && (
                    <div className={styles.inputContainer}>

                        <div className={styles.card}>
                            <h4 className={styles.cardHeader}>Name:</h4>
                            <p className={styles.cardContent}>
                                {agent?.name ?? "No name"}
                            </p>
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
        // </div>
    );
}