const JobLog = require('../models/JobLog');

// Execute a job definition with full instrumentation:
//  - opens a JobLog (status: running)
//  - runs the handler, timing it
//  - records success (+ result) or failure (+ error message)
// Errors are caught here so a failing job never crashes the scheduler or the
// request that triggered it. Returns the saved JobLog document.
const runJob = async (jobDef, { trigger = 'scheduled', triggeredBy } = {}) => {
  const startedAt = new Date();
  const log = await JobLog.create({
    job: jobDef.name,
    trigger,
    triggeredBy,
    status: 'running',
    startedAt,
  });

  try {
    const result = await jobDef.handler();
    log.status = 'success';
    log.result = result;
  } catch (err) {
    log.status = 'failure';
    log.error = err.message;
    console.error(`Job "${jobDef.name}" failed:`, err.message);
  } finally {
    log.finishedAt = new Date();
    log.durationMs = log.finishedAt - startedAt;
    await log.save();
  }

  return log;
};

module.exports = runJob;
