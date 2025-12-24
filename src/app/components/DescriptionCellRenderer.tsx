
import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "./DescriptionCellRendered.module.css";


export const DescriptionCellRenderer = (props: any) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            top: rect.top + window.scrollY + 20,
            left: rect.left + window.scrollX + 20,
        });
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <>
            <div
                className={styles.descriptionCell}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {props.value}
            </div>
            {showTooltip &&
                ReactDOM.createPortal(
                    <div
                        className={styles.descriptionTooltip}
                        style={{
                            top: position.top,
                            left: position.left,
                            position: "absolute",
                        }}
                    >
                        {props.value}
                    </div>,
                    document.body
                )}
        </>
    );
};