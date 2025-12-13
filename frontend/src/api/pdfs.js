const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetch all PDFs from backend
 */
export const getPDFIds = async () => {
  const response = await fetch(`${API_URL}/pdf`);
  if (!response.ok) {
    throw new Error('Failed to fetch PDF IDs');
  }
  const data = await response.json();
  console.log(data);
  return data.map(pdf => pdf._id);
};

/**
 * @param {String} id
 */
export const fetchPDFById = async (id) => {
  const response = await fetch(`${API_URL}/pdf/${id}`);
  if (!response.ok) throw new Error("Failed to fetch PDF");

  const arrayBuffer = await response.arrayBuffer(); // get raw bytes
  return arrayBuffer; // pass directly to PdfDisplay or iframe
};

/**
 * Create a new PDF
 * @param {FormData} pdfData - { Buffer }
 */
export const createPDF = async (pdfData) => {
  const response = await fetch(`${API_URL}/pdf`, {
    method: 'POST',
    body: pdfData,
  });
  if (!response.ok) {
    throw new Error('Failed to create PDF');
  }
  return response.json();
};

/**
 * Update a PDF
 * @param {string} id - PDF ID
 * @param {FormData} updates - { Buffer }
 */
export const updatePDF = async (id, updates) => {
  const response = await fetch(`${API_URL}/pdf/${id}`, {
    method: 'PUT',
    body: updates,
  });
  if (!response.ok) {
    throw new Error('Failed to update pdf');
  }
  return response.json();
};

/**
 * Delete a PDF
 * @param {string} id - PDF ID
 */
export const deletePDF = async (id) => {
  const response = await fetch(`${API_URL}/pdf/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete pdf');
  }
  return response.json();
};
