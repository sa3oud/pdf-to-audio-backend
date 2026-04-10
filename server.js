const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer to store in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 } // 200 MB max
});

app.post('/extract-text', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    
    console.log(`Processing PDF: ${req.file.originalname}, size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Extract text using pdf-parse (streams internally, memory efficient)
    const data = await pdfParse(req.file.buffer);
    
    const extractedText = data.text;
    const pageCount = data.numpages;
    const wordCount = extractedText.split(/\s+/).length;
    
    console.log(`Extracted ${wordCount} words from ${pageCount} pages`);
    
    res.json({
      success: true,
      text: extractedText,
      pageCount,
      wordCount
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: error.message || 'Failed to extract text' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
