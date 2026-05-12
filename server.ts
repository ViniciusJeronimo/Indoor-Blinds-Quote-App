import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(bodyParser.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/send-quote", async (req, res) => {
    const { quote, pdfBase64, recipientType, targetEmail } = req.body;

    if (!quote || !pdfBase64 || !targetEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Configure transporter
      // For demo purposes, we'll use a mock if no SMTP settings are provided
      const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
      
      let transporter;
      if (hasSmtp) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Mock transporter for development
        console.log("[Server] No SMTP credentials found. Using mock transporter.");
        transporter = {
          sendMail: async (mailOptions: any) => {
            console.log(`[MOCK EMAIL] Sent to: ${mailOptions.to}`);
            console.log(`[MOCK EMAIL] Subject: ${mailOptions.subject}`);
            console.log(`[MOCK EMAIL] Attachment: ${mailOptions.attachments[0].filename}`);
            return { messageId: "mock-id" };
          }
        };
      }

      const subject = recipientType === 'company' 
        ? `New Quote Internal Copy: #${quote.customer.customerNumber} - ${quote.customer.lastName}`
        : `Your Blinds Quote: #${quote.customer.customerNumber} from BlindsQuote Pro`;

      const filename = recipientType === 'company'
        ? `Quote_${quote.customer.customerNumber}_CompanyCopy.pdf`
        : `Quote_${quote.customer.customerNumber}_CustomerCopy.pdf`;

      const mailOptions = {
        from: process.env.SMTP_USER || '"BlindsQuote Pro" <quotes@example.com>',
        to: targetEmail,
        subject: subject,
        text: `Please find attached the ${recipientType === 'company' ? 'internal' : 'customer'} copy of the quote for ${quote.customer.firstName} ${quote.customer.lastName}.`,
        attachments: [
          {
            filename: filename,
            content: pdfBase64,
            encoding: 'base64'
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: `Email sent to ${targetEmail}` });
    } catch (error) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
