import mongoose from "mongoose";

// TODO: Define your Task schema here
const pdfSchema = new mongoose.Schema({
  pdfBytes: {
    type: Buffer,
    required: true
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

const PDF = mongoose.model("PDF", pdfSchema);
export default PDF;