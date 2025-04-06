// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleCompletedTask // if added
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // 🔐 All routes are protected

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', toggleCompletedTask); // ✅ if needed

module.exports = router;
