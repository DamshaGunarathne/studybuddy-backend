const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String },
  dueDate: { type: Date },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  estimatedMinutes: { type: Number },
  usePomodoro: { type: Boolean, default: false },
  description: { type: String },
  reminder: { type: Boolean, default: false },

  // ✅ Task completion flag
  completed: { type: Boolean, default: false },

  // 🔐 Link to the user who created the task
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 🔁 Recurring task support
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },

  // 🎨 Optional color field for frontend theming
  color: {
    type: String,
    default: '#00BCD4' // Teal
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
