const Record = require('../models/Record');

// "Send" a daily summary email. No real SMTP is wired up — this mocks delivery
// by composing the summary and logging it (swap the `deliver` step for nodemailer
// or an email provider in production). Returns the summary for the JobLog.
const sendEmailSummary = async () => {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [total, active, archived, createdToday] = await Promise.all([
    Record.countDocuments(),
    Record.countDocuments({ status: 'active' }),
    Record.countDocuments({ status: 'archived' }),
    Record.countDocuments({ createdAt: { $gte: dayAgo } }),
  ]);

  const to = process.env.SUMMARY_EMAIL || 'admin@example.com';
  const summary = { total, active, archived, createdToday };

  // Mock delivery.
  console.log(`[email-summary] -> ${to}:`, JSON.stringify(summary));

  return { to, summary, sentAt: now };
};

module.exports = sendEmailSummary;
