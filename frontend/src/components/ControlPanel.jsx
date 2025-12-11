import { useState } from "react";
import "./ControlPanel.css";

function ControlPanel({ handleFileUpload, setDisplaySwitch, setWhiteOut, whiteOut, setDrawText, drawText }) {
    const [activeMode, setActiveMode] = useState(null);

    function toggleWhiteOut() {
        setActiveMode(activeMode === "whiteout" ? null : "whiteout");
        setWhiteOut();
        if (drawText) {
            setDrawText();
        }
    }

    function toggleDrawText() {
        setActiveMode(activeMode === "text" ? null : "text");
        setDrawText();
        if (whiteOut) {
            setWhiteOut();
        }
    }


    return (
        <div className="control-panel">
            <h2 className="panel-title">PDF Controls</h2>

            <div className="panel-actions">
                <label className="upload-label">
                    📄 Upload PDF
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="file-input"
                    />
                </label>
                <button className="generate-btn" onClick={setDisplaySwitch}>
                    Switch Display
                </button>
                <span>
                    <button className={`toggle-button ${activeMode === "whiteout" ? "active" : ""}`} onClick={toggleWhiteOut}>
                        White Out
                    </button>
                    <button className={`toggle-button ${activeMode === "text" ? "active" : ""}`} onClick={toggleDrawText}>
                        Text
                    </button>
                </span>
            </div>
        </div>
    );
}

export default ControlPanel;
