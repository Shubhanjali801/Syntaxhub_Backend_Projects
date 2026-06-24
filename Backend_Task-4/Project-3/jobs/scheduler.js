const cron = require('node-cron');
const { jobs } = require('./registry');
const runJob = require('../utils/runJob');

// Register every job in the registry with node-cron. Invalid cron expressions
// are skipped with a warning (rather than crashing startup). Set
// ENABLE_SCHEDULER=false to register nothing — jobs remain triggerable via the API.
const startScheduler = () => {
  if (process.env.ENABLE_SCHEDULER === 'false') {
    console.log('Scheduler disabled (ENABLE_SCHEDULER=false). Jobs are manual-only.');
    return;
  }

  jobs.forEach((jobDef) => {
    if (!cron.validate(jobDef.schedule)) {
      console.warn(`Skipping "${jobDef.name}": invalid cron expression "${jobDef.schedule}"`);
      return;
    }
    cron.schedule(jobDef.schedule, () => {
      runJob(jobDef, { trigger: 'scheduled' });
    });
    console.log(`Scheduled "${jobDef.name}" with cron "${jobDef.schedule}"`);
  });
};

module.exports = startScheduler;
