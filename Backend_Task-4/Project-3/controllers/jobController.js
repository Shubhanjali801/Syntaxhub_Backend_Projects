const { jobs, getJob } = require('../jobs/registry');
const JobLog = require('../models/JobLog');
const runJob = require('../utils/runJob');

// GET /jobs  — list registered scheduled jobs with their last execution.
exports.listJobs = async (req, res, next) => {
  try {
    const data = await Promise.all(
      jobs.map(async (j) => {
        const lastRun = await JobLog.findOne({ job: j.name }).sort({ createdAt: -1 });
        return {
          name: j.name,
          description: j.description,
          schedule: j.schedule,
          lastRun: lastRun
            ? {
                status: lastRun.status,
                trigger: lastRun.trigger,
                startedAt: lastRun.startedAt,
                durationMs: lastRun.durationMs,
              }
            : null,
        };
      })
    );
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    return next(err);
  }
};

// POST /jobs/:name/run  — trigger a job immediately (manual run).
exports.triggerJob = async (req, res, next) => {
  try {
    const jobDef = getJob(req.params.name);
    if (!jobDef) {
      return res.status(404).json({ success: false, message: `Unknown job: ${req.params.name}` });
    }

    const log = await runJob(jobDef, { trigger: 'manual', triggeredBy: req.user._id });
    const status = log.status === 'failure' ? 500 : 200;
    return res.status(status).json({
      success: log.status !== 'failure',
      message: `Job "${jobDef.name}" finished with status: ${log.status}`,
      data: log,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /jobs/logs  — execution history (?job=&status=&page=&limit=)
exports.getJobLogs = async (req, res, next) => {
  try {
    const { job, status } = req.query;
    const filter = {};
    if (job) filter.job = job;
    if (status) filter.status = status;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      JobLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      JobLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (err) {
    return next(err);
  }
};
