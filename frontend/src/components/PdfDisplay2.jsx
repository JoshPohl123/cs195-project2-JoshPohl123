import "./PdfDisplay2.css"
import { useEffect, useState } from "react";


function PdfDisplay2({ pdfBytes }) {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (!pdfBytes) return;
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [pdfBytes]);

    return (
        <div className="pdf-display">
            {pdfUrl && (
                <iframe
                    src={pdfUrl}
                />
            )}
        </div>
    );
}

export default PdfDisplay2;