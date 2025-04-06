const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching tasks.' });
  }
};

// @desc    Get a single task
// @route   GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Invalid Task ID.' });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user._id, // 🧠 Make sure tasks are assigned to the logged-in user
    });
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTask) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task.' });
  }
};

// ✅ Toggle completion status
exports.toggleCompletedTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) return res.status(404).json({ error: 'Task not found or unauthorized' });

    task.completed = !task.completed;
    await task.save();

    res.json({
      message: `Task marked as ${task.completed ? 'completed' : 'incomplete'}`,
      task
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
