
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Ensure the environment variables are loaded
const gmailEmail = process.env.GMAIL_EMAIL;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailEmail || !gmailAppPassword) {
  console.warn("Gmail credentials are not set. Email functionality will be disabled.");
}

// Create a Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailAppPassword,
  },
});

interface SendEmailBody {
    to: string;
    subject: string;
    html: string;
}

export async function POST(req: NextRequest) {
  if (!gmailEmail || !gmailAppPassword) {
    console.error('Gmail credentials are not configured.');
    return NextResponse.json({ message: 'Email service is not configured.' }, { status: 500 });
  }

  try {
    const { to, subject, html }: SendEmailBody = await req.json();

    const mailOptions = {
      from: gmailEmail, // Sender address
      to: to, // List of recipients
      subject: subject, // Subject line
      html: html, // HTML body
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully', info }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}
