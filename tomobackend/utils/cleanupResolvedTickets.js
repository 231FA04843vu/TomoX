const SupportMessage = require("../models/SupportMessage");

const cleanupOldResolvedTickets = async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deleted = await SupportMessage.deleteMany({
      status: "resolved",
      resolvedAt: { $lte: sevenDaysAgo },
    });

    if (deleted.deletedCount > 0) {
      console.log(`🧹 Cleanup complete. Removed ${deleted.deletedCount} resolved tickets.`);
    } else {
      console.log("🧼 No old resolved tickets to clean.");
    }
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
  }
};

module.exports = cleanupOldResolvedTickets;
