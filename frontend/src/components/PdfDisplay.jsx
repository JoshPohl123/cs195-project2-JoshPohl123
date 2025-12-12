import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import jsPDF from "jspdf";

import "./PdfDisplay.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const PdfDisplay = forwardRef(({ pdfBytes, whiteOut, drawText }, ref) => {
  const containerRef = useRef();
  const startPos = useRef(null);
  const activeBox = useRef(null);
  const undoStacks = useRef({});
  const globalStack = [];
  const whiteoutRef = useRef(whiteOut);
  const drawTextRef = useRef(drawText);
  

  useEffect(() => {
    whiteoutRef.current = whiteOut;
    drawTextRef.current = drawText;
  }, [whiteOut, drawText]);

  useEffect(() => {
    if (!pdfBytes) return;

    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      const container = containerRef.current;
      container.innerHTML = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(i);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        // Canvas
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Wrapper
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        wrapper.style.marginBottom = "20px";

        // Overlay (100% guaranteed match)
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.left = 0;
        overlay.style.top = 0;
        overlay.style.width = `${viewport.width}px`;
        overlay.style.height = `${viewport.height}px`;
        overlay.style.zIndex = 20;
        overlay.style.pointerEvents = "auto";
        overlay.style.background = "transparent";
        overlay.tabIndex = i;

        // ---- MOUSE EVENTS ----
        overlay.addEventListener("mousedown", (e) => {
          // 🔥 Prevent creating a new text box when clicking inside an existing one
          if (e.target.tagName === "INPUT") return;

          const rect = overlay.getBoundingClientRect();
          startPos.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          
          overlay.focus({ preventScroll: true });
          const pageIndex = overlay.tabIndex // index of the page you are drawing on

          const ctx = canvas.getContext("2d");
          const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

          if (whiteoutRef.current) {
            const box = document.createElement("div");
            box.className = "draw-box";
            box.style.position = "absolute";
            box.style.border = "2px solid blue";
            box.style.background = "rgba(255,255,255,0.3)";
            box.style.left = `${startPos.current.x}px`;
            box.style.top = `${startPos.current.y}px`;

            overlay.appendChild(box);
            activeBox.current = box;

            if (!undoStacks.current[pageIndex]) undoStacks.current[pageIndex] = [];
            undoStacks.current[pageIndex].push(snapshot);
            globalStack.push({ pageIndex, snapshot, box: null });    
          }

          if (drawTextRef.current) {
            // Create temporary text input at mouse position
            const input = document.createElement("input");
            input.type = "text";
            input.className = "selection-input";
            input.style.position = "absolute";
            input.style.color = "black";
            input.style.background = "rgba(255,255,255,0.3)";
            input.style.left = `${startPos.current.x}px`;
            input.style.top = `${startPos.current.y}px`;
            overlay.appendChild(input);
            input.focus();

            activeBox.current = input;

            // Commit on Enter
            input.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                const text = input.value;
                const ctx = canvas.getContext("2d");

                // draw text
                ctx.font = "16px Arial";
                ctx.fillStyle = "black";
                ctx.fillText(text, startPos.current.x, startPos.current.y + 16);

                if (!undoStacks.current[pageIndex]) undoStacks.current[pageIndex] = [];
                undoStacks.current[pageIndex].push(snapshot);
                const top = startPos.current.y
                globalStack.push({ pageIndex, snapshot, box:{top} });

                input.remove();
                activeBox.current = null;
                startPos.current = null;
              }
            });

            input.addEventListener("keydown", (e) => {
              if (e.key === "Escape") {
                input.remove();
                activeBox.current = null;
                startPos.current = null;
              }
            })
            
          }
          
        });

        overlay.addEventListener("mousemove", (e) => {
          if (!activeBox.current) return;
          if (whiteoutRef.current) {
            const rect = overlay.getBoundingClientRect();
            const curX = e.clientX - rect.left;
            const curY = e.clientY - rect.top;

            const sx = startPos.current.x;
            const sy = startPos.current.y;

            // Resize box
            activeBox.current.style.left = `${Math.min(curX, sx)}px`;
            activeBox.current.style.top = `${Math.min(curY, sy)}px`;
            activeBox.current.style.width = `${Math.abs(curX - sx)}px`;
            activeBox.current.style.height = `${Math.abs(curY - sy)}px`;
          }
          
        });

        overlay.addEventListener("mouseup", () => {
          if (whiteoutRef.current) {
            ctx.fillStyle = "white"; 

            const x = parseFloat(activeBox.current.style.left);
            const y = parseFloat(activeBox.current.style.top);
            const w = parseFloat(activeBox.current.style.width);
            const h = parseFloat(activeBox.current.style.height);

            ctx.fillRect(x, y, w, h);
            
            const lastAction = globalStack[globalStack.length - 1];
            lastAction.box = { left: x, top: y, width: w, height: h };

            activeBox.current.remove();
            activeBox.current = null;
            startPos.current = null;
          }
        });

        overlay.addEventListener("keydown", (e) => {
          console.log(e.key);
          console.log("globalStack: " + globalStack);
          if (e.key === "Backspace" && globalStack.length > 0) {
            const lastAction = globalStack.pop();
            const { pageIndex, snapshot, box } = lastAction;

            const wrapper = containerRef.current.children[pageIndex - 1];
            const canvas = wrapper.querySelector("canvas");
            const ctx = canvas.getContext("2d");

            // Restore snapshot
            ctx.putImageData(snapshot, 0, 0);

            // Scroll container to rectangle
            const container = containerRef.current;
            const wrapperRect = wrapper.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const scrollTop = wrapper.offsetTop + box.top; 
            // optional offset above box
            const offset = container.clientHeight / 2 - box.height / 2;
            container.scrollTo({ top: scrollTop - offset, behavior: "smooth" });
          }
          
        });

        // Append elements
        wrapper.appendChild(canvas);
        wrapper.appendChild(overlay);
        container.appendChild(wrapper);
      }
    };

    loadPdf();
  }, [pdfBytes]);

  // Expose generateEditedPdf to parent
  useImperativeHandle(ref, () => ({
      generateEditedPdf
  }));

  async function generateEditedPdf() {
    const pdf = new jsPDF({ unit: "px", format: "a4" });

    const pages = containerRef.current.querySelectorAll("canvas");

    pages.forEach((canvas, i) => {
      const img = canvas.toDataURL("image/png");

      if (i > 0) pdf.addPage();

      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();

      pdf.addImage(img, "PNG", 0, 0, w, h);
    });

    // Create a uint8 buffer instead of downloading
    const newPdfBytes = pdf.output("arraybuffer");

    return newPdfBytes;
  }

  return <div ref={containerRef} className="pdf-container"></div>;
});

export default PdfDisplay;