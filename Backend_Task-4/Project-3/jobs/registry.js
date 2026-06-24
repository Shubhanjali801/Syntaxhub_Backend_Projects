const deleteStaleRecords = require('./deleteStaleRecords');
const sendEmailSummary = require('./sendEmailSummary');

// Central catalogue of schedulable jobs. Each entry pairs a handler with a cron
// schedule (overridable via env). Controllers and the scheduler both read from
// here so the API and the cron registration never drift apart.
const jobs = [
  {
    name: 'deleteStaleRecords',
    description: 'Delete records whose expiry has passed (or that are older than STALE_RECORD_DAYS).',
    schedule: process.env.CRON_DELETE_STALE || '0 * * * *', // hourly
    handler: deleteStaleRecords,
  },
  {
    name: 'sendEmailSummary',
    description: 'Compose and (mock) send a daily summary of record counts.',
    schedule: process.env.CRON_EMAIL_SUMMARY || '0 8 * * *', // daily at 08:00
    handler: sendEmailSummary,
  },
];

const getJob = (name) => jobs.find((j) => j.name === name);

module.exports = { jobs, getJob };
