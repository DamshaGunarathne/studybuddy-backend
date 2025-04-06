const cron = require('node-cron');
const Task = require('../models/Task');

// 🔁 This cron job runs every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running repeating task job...');

  try {
    const tasks = await Task.find({ repeat: { $ne: 'none' } });

    for (const task of tasks) {
      const current = new Date(task.dueDate);
      let nextDate;

      // 🧠 Determine next due date
      switch (task.repeat) {
        case 'daily':
          nextDate = new Date(current.setDate(current.getDate() + 1));
          break;
        case 'weekly':
          nextDate = new Date(current.setDate(current.getDate() + 7));
          break;
        case 'monthly':
          nextDate = new Date(current.setMonth(current.getMonth() + 1));
          break;
        default:
          continue;
      }

      // ✅ Prevent duplicate clone
      const exists = await Task.findOne({
        title: task.title,
        dueDate: nextDate,
        user: task.user,
      });

      if (!exists) {
        const cloned = new Task({
          ...task.toObject(),
          _id: undefined, // Avoid conflict with MongoDB _id
          createdAt: undefined,
          updatedAt: undefined,
          dueDate: nextDate,
        });

        await cloned.save();
        console.log(`✅ Task cloned for user: ${task.user} → ${cloned.title}`);
      } else {
        console.log(`⚠️ Duplicate found, skipping: ${task.title} on ${nextDate}`);
      }
    }

    console.log('🎯 Recurring task job completed!');
  } catch (err) {
    console.error('❌ Error running recurring task job:', err);
  }
});
