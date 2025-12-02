import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials not found. Email not sent.');
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Aphelion Pulsar" <no-reply@example.com>',
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
