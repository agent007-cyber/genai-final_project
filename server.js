require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini with your API key from .env
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get('/', (req, res) => {
  res.send('Resume AI server is running!');
});

// Generate resume and cover letter (JSON or PDF)
app.post('/generate', async (req, res) => {
  const { name, education, experience, role, format } = req.body;

  const prompt = `Generate a professional resume and cover letter for ${name}, 
who has an education background in ${education}, 
work experience in ${experience}, 
and is applying for the role of ${role}.`;

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const generatedText =
      result.candidates &&
      result.candidates[0] &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0] &&
      result.candidates[0].content.parts[0].text
        ? result.candidates[0].content.parts[0].text
        : "No text generated.";

    if (format === "pdf") {
      // Generate PDF using pdfkit
      const doc = new PDFDocument();
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=resume_cover_letter.pdf',
        });
        res.send(pdfData);
      });

      
      doc.fontSize(12).text(generatedText, { lineGap: 4 });
      doc.end();
    } else {
      
      res.json({ result: generatedText });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate resume and cover letter.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
