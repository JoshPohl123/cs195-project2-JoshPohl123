import { useState } from 'react'
import './App.css'

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

import PdfDisplay from './components/PdfDisplay';
import ControlPanel from './components/ControlPanel';
import PdfDisplay2 from './components/PdfDisplay2';


function App() {
  const [pdfFile, setPdfFile] = useState(null);

  async function createPdf() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 24;

    page.drawText("Hello PDF!", {
      x: 50,
      y: 750,
      size: fontSize,
      font,
      color: rgb(0, 0.53, 0.71),
    });

    // Save PDF as Uint8Array
    const pdfBytes = await pdfDoc.save();

    // Convert Uint8Array to ArrayBuffer
    const pdfBuffer = pdfBytes.buffer.slice(0); // copy ArrayBuffer

    setPdfFile(pdfBuffer); // <-- pass ArrayBuffer, not Uint8Array
  }



  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBufferCopy = reader.result.slice(0); // copy ArrayBuffer
      setPdfFile(arrayBufferCopy); // pass ArrayBuffer
    };
    reader.readAsArrayBuffer(file);
  }


  return (
    <div className="app-wrapper">
      <h1 className="app-header">PDF Editor</h1>

      <div className="app-container">
        <ControlPanel 
          createPdf={createPdf}
          handleFileUpload={handleFileUpload}
        />

        <div className="display-area">
          {pdfFile ? (
            <PdfDisplay2 pdfBytes={pdfFile} />
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
