import "./ControlPanel.css";

function ControlPanel({ createPdf, handleFileUpload }) {
    return (
        <div className="control-panel">
            <h2 className="panel-title">PDF Controls</h2>

            <div className="panel-actions">

                {/* <button className="generate-btn" onClick={createPdf}>
                    ➕ Generate PDF
                </button> */}

                <label className="upload-label">
                    📄 Upload PDF
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="file-input"
                    />
                </label>
            </div>
        </div>
    );
}

export default ControlPanel;
