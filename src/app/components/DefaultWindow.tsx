import React from "react";
import styles from "./DefaultWindow.module.css";

export default function DefaultWindow() {
    return (
        <div className={styles.Window}>
            <div className={styles.content}>
                <h1>Select an agent to start!</h1>
            </div>
        </div>
    )
}