import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, hotel, email, phone, message } = req.body ?? {};
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  );

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'fabrizioroq@gmail.com',
      replyTo: email,
      subject: `New contact — ${hotel || 'Presence Hospitality'}`,
      text: `Name: ${name}\nHotel: ${hotel}\nEmail: ${email}\nPhone: ${phone || '-'}\nMessage: ${message}`,
    });

    await supabaseAdmin.from('leads').insert({ name, hotel, email, phone, message });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact form submission failed', err);
    return res.status(500).json({ ok: false });
  }
}
