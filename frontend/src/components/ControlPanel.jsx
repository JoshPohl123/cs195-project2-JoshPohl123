import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import "./ControlPanel.css";

const ControlPanel = forwardRef(({ 
    handleFileUpload, 
    setDisplaySwitch, 
    displaySwitch, 
    setWhiteOut, 
    whiteOut, 
    setDrawText, 
    drawText,
    handleSave,
    handleClose,
    hasFile,
    PDFIds,
    handlePDFByID,
    handlePDFDelete,
    activePDFID
}, ref) => {
    const [activeMode, setActiveMode] = useState(null);
    const fileRef = useRef();

    function toggleWhiteOut() {
        setActiveMode(activeMode === "whiteout" ? null : "whiteout");
        setWhiteOut();
        if (drawText) {
            setDrawText();
        }
    };

    function toggleDrawText() {
        setActiveMode(activeMode === "text" ? null : "text");
        setDrawText();
        if (whiteOut) {
            setWhiteOut();
        }
    };

    function handleCloseExtension() {
        handleClose();
        if (fileRef.current) fileRef.current.value = "";
    };

    function handleSaveExtension() {
        let update = false;
        console.log("update: "+update);
        console.log("activePDFID: "+ activePDFID)
        if (activePDFID !== null) {
            update = activePDFID;
            console.log("update: "+update);
        }

        handleSave(update);
    };

    useImperativeHandle(ref, () => ({
        removeFileRefValue() {
            if (fileRef.current) fileRef.current.value = "";
        }
    }));


    return (
        <div className="control-panel">
            <h2 className="panel-title">PDF Controls</h2>

            <div className="panel-actions">
                <span>
                    {!displaySwitch ? (
                        <button className="save-btn" onClick={handleSaveExtension}>
                            Save
                        </button>
                    ) : (
                        <></>
                    )}
                    
                    <button className="close-btn" onClick={handleCloseExtension}>
                        Close
                    </button>
                </span>

                <label className="upload-label">
                    📄 Upload PDF
                    <input
                        ref={fileRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="file-input"
                    />
                </label>
                {hasFile ? (
                    <button className="generate-btn" onClick={setDisplaySwitch}>
                        {displaySwitch ? (
                            "Simple View"
                        ) : (
                            "Canvas Editing"
                        )}
                    </button>
                ) : (
                    <></>
                )}
                
                {!displaySwitch ? (
                    <span>
                        <button className={`toggle-button ${activeMode === "whiteout" ? "active" : ""}`} onClick={toggleWhiteOut}>
                            White Out
                        </button>
                        <button className={`toggle-button ${activeMode === "text" ? "active" : ""}`} onClick={toggleDrawText}>
                            Text
                        </button>
                    </span>
                ) : (
                    <></>
                )}

                {PDFIds && PDFIds.map((pdf, index) => (
                    <span key={index}>
                        <button className="pdf-btn" onClick={() => handlePDFByID(pdf)}>{pdf}</button>
                        <button className="delete" onClick={() => handlePDFDelete(pdf)}>🗑️</button>
                    </span>
                    
                ))}

                
            </div>
        </div>
    );
});

export default ControlPanel;
