import nodemailer from 'nodemailer';

export async function enviarEmail(destinatario, assunto, texto) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: `"LifeTrack" <${process.env.SMTP_USER}>`,
    to: destinatario,
    subject: assunto,
    text: texto
  });

  console.log("Email enviado:", info.messageId);
}
