import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { useEffect, useRef, useState } from "react";
import "./PdfDisplay.css";

// Make sure you copied pdf.worker.min.js to public/
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PdfDisplay({ pdfBytes, onAddText }) {
  const containerRef = useRef();
  const startRef = useRef(null);
  const pageRef = useRef(null); // store which page overlay is active

  useEffect(() => {
    if (!pdfBytes) return;

    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
      const container = containerRef.current;
      container.innerHTML = ""; // clear previous pages

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        // Canvas for rendering
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        await page.render({ canvasContext: context, viewport }).promise;

        // Page wrapper
        const pageWrapper = document.createElement("div");
        pageWrapper.className = "pdf-page-wrapper";
        pageWrapper.style.position = "relative";
        pageWrapper.appendChild(canvas);

        container.appendChild(pageWrapper);
      }
    };

    loadPdf();
  }, [pdfBytes]);

  return (
    <div className="pdf-container" ref={containerRef}></div>
  );
}
