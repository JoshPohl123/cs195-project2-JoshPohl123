import express from "express";
import PDF from "../models/pdf.js";
import multer from "multer";
import { Buffer } from "buffer";

const router = express.Router();
const upload = multer();

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "FocusTools API",
    status: "Running",
    endpoints: {
      pdf: "/pdf",
    },
  });
});

// TODO: Add your PDF routes here
// POST /PDFs
router.post("/pdf", upload.single("pdf"), async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const pdfDoc = new PDF({ pdfBytes: pdfBuffer });
    await pdfDoc.save();

    res.status(201).json({ message: "PDF saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save PDF" });
  }
});

// GET /PDFs
router.get("/pdf", async (req, res) => {
  try {
    const Pdfs = await PDF.find();
    res.json(Pdfs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET PDF by ID as a PDF file
router.get("/pdf/:id", async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).send("PDF not found");

    // pdf.pdfBytes might be Mongoose Binary or Buffer
    const buffer = pdf.pdfBytes.buffer ? Buffer.from(pdf.pdfBytes.buffer) : pdf.pdfBytes;

    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  } catch (err) {
    console.error("GET /pdf/:id error:", err);
    res.status(500).send(err.message);
  }
});

// PUT /PDFs/:id
router.put("/pdf/:id", upload.single("pdf"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const updatedPdf = await PDF.findByIdAndUpdate(
        req.params.id, // Which PDF to update
        { pdfBytes: req.file.buffer },
        {
        new: true, // Return updated version
        runValidators: true, // Check schema rules
        }
    );

    if (!updatedPdf) {
      return res.status(404).json({
        message: "PDF not found",
      });
    }

    res.json(updatedPdf);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /PDFs/:id
router.delete("/pdf/:id", async (req, res) => {
  try {
    const deletedPdf = await PDF.findByIdAndDelete(req.params.id);

    if (!deletedPdf) {
      return res.status(404).json({
        message: "PDF not found",
      });
    }

    res.json({
      message: "PDF deleted successfully",
      book: deletedPdf,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;