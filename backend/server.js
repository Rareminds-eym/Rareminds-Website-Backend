import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Starting backend server...');

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const FRONTEND_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://rareminds.in'
    : 'http://localhost:5173';

// Allow only your frontend domain in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://rareminds.in'
    : 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// Existing PDF email endpoint
app.post('/api/send-pdf', async (req, res) => {
  const { name, email, pdfUrl, institution } = req.body;
  if (!name || !email || !pdfUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Your Requested Case Study PDF${institution ? ` - ${institution}` : ''}`,
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for your interest. Here is your requested case study${institution ? ` for <b>${institution}</b>` : ''}:</p>
        <p><a href="${FRONTEND_BASE_URL}${pdfUrl}" target="_blank" rel="noopener">Download PDF</a></p>
        <p>Best regards,<br/>Rareminds Team</p>
      `,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// New contact form email endpoint
app.post('/api/send-contact-email', async (req, res) => {
  const { name, university, email, course, message } = req.body;
  if (!name || !university || !email || !course || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'marketing@rareminds.in',
      subject: 'New University Demo Enquiry',
      html: `
        <h2>New Enquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>University:</strong> ${university}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Course:</strong> ${course}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));