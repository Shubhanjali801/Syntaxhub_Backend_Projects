const Record = require('../models/Record');

// Delete stale records. A record is stale when:
//   - it has an explicit `expiresAt` in the past, OR
//   - it has no expiry but was created more than STALE_RECORD_DAYS ago.
// Returns a small summary that gets stored on the JobLog.
const deleteStaleRecords = async () => {
  const now = new Date();
  const staleDays = parseInt(process.env.STALE_RECORD_DAYS, 10) || 30;
  const cutoff = new Date(now.getTime() - staleDays * 24 * 60 * 60 * 1000);

  const filter = {
    $or: [
      { expiresAt: { $lt: now } },
      { expiresAt: { $exists: false }, createdAt: { $lt: cutoff } },
      { expiresAt: null, createdAt: { $lt: cutoff } },
    ],
  };

  const { deletedCount } = await Record.deleteMany(filter);
  return { deletedCount, staleDays, ranAt: now };
};

module.exports = deleteStaleRecords;
