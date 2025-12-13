import { useState, useEffect, useRef } from 'react'
import { Buffer } from 'buffer';
import './App.css'

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

import CanvasView from './components/CanvasView';
import ControlPanel from './components/ControlPanel';
import SimpleView from './components/SimpleView';
import { getPDFIds, fetchPDFById, createPDF, updatePDF, deletePDF } from './api/pdfs';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [displaySwitch, setDisplaySwitch] = useState(true);
  const [whiteOut, setWhiteOut] = useState(false);
  const [drawText, setDrawText] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [PDFIds, setPDFIds] = useState([]);
  const [error, setError] = useState(null);
  const [listTrigger, activateTrigger] = useState(true);
  const [activePDFID, setActivePDFID] = useState(null);
  const pdfRef = useRef();
  const controlRef = useRef();

  useEffect(() => {
    if (pdfFile !== null) {
      setHasFile(true);
    } else {
      setHasFile(false);
    }
  }, [pdfFile]);

  useEffect(() => {
    console.log("getting IDS");
    listPDFs();
  }, [listTrigger]);

  function handleFileUpload(e) {
    if (pdfFile !== null) {
      handleClose();
      controlRef.current.removeFileRefValue();
    } 
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBufferCopy = reader.result.slice(0); // copy ArrayBuffer
      setPdfFile(arrayBufferCopy); // pass ArrayBuffer
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleSave(update) {
    if (!pdfRef.current) return;
    const newPdfBytes = await pdfRef.current.generateEditedPdf();
    console.log(newPdfBytes);

    // Convert to base64 if sending via JSON:
    const formData = new FormData();
    formData.append("pdf", new Blob([newPdfBytes], { type: "application/pdf" }));

    // POST to your backend

    try {
      if (!update) {
        const newPDF = await createPDF( formData );
        controlRef.current.removeFileRefValue();
        activateTrigger(!listTrigger);
        console.log("New Save");
      } else {
        const updatedPDF = await updatePDF( activePDFID, formData );
        console.log("Update");
      }
    } catch (err) {
      console.error('Error creating PDF:', err);
      setError('Failed to add PDF');
    } 
  }

  function handleClose() {
    setPdfFile(null);
    setDisplaySwitch(true);
    setActivePDFID(null);
  }

  async function listPDFs() {
    try {
      const temp = await getPDFIds();
      console.log("temp: "+temp);
      setPDFIds(temp);
    } catch (err) {
      console.error('Error listing PDF IDs:', err);
      setError('Failed to list PDF IDs');
    } 
  }

  async function handlePDFByID(id) {
    try {
      controlRef.current.removeFileRefValue();
      const temp = await fetchPDFById(id);
      console.log("temp: "+temp);
      setPdfFile(temp);
      setActivePDFID(id);
    } catch (err) {
      console.error('Error Getting PDF By ID:', err);
      setError('Failed to get PDF');
    } 
  }

  async function handlePDFDelete(id) {
    try {
      const temp = await deletePDF(id);
      console.log(temp);
      activateTrigger(!listTrigger);
    } catch (err) {
      console.error('Error Deleting PDF By ID:', err);
      setError('Failed to delete PDF');
    }
  }


  return (
    <div className="app-wrapper">
      <h1 className="app-header">PDF Editor</h1>

      <div className="app-container">
        <ControlPanel 
          ref={controlRef}
          handleFileUpload={handleFileUpload}
          setDisplaySwitch={() => setDisplaySwitch(!displaySwitch)}
          displaySwitch={displaySwitch}
          setWhiteOut={() => setWhiteOut(!whiteOut)}
          whiteOut={whiteOut}
          setDrawText={() => setDrawText(!drawText)}
          drawText={drawText}
          handleSave={handleSave}
          handleClose={handleClose}
          hasFile={hasFile}
          PDFIds={PDFIds}
          handlePDFByID={handlePDFByID}
          handlePDFDelete={handlePDFDelete}
          activePDFID={activePDFID}
        />

        <div className="display-area">
          {error && (
            <div className="error-banner">
              ⚠️ {error}
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}
          {pdfFile ? (
            displaySwitch ? (
              <SimpleView key={"iframe"} pdfBytes={pdfFile} />
            ) : (
              <CanvasView key={"canvas"} ref={pdfRef} pdfBytes={pdfFile} whiteOut={whiteOut} drawText={drawText} />
            )
          ) : (
            <div className="pdf-placeholder">
              No PDF loaded
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App
