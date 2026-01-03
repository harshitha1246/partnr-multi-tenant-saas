const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth.middleware');
const {
    createTask,
    listProjectTasks,  // ✅ corrected
    updateTaskStatus,
    updateTask
} = require('../controllers/task.controller');

// ---------------- API 16: Create Task ----------------
// POST /api/projects/:projectId/tasks
router.post(
  '/projects/:projectId/tasks',
  authenticate,
  createTask
);

// ---------------- API 17: List Project Tasks ----------------
// GET /api/projects/:projectId/tasks
router.get(
  '/projects/:projectId/tasks',
  authenticate,
  listProjectTasks
);

// ---------------- API 18: Update Task Status ----------------
// PATCH /api/tasks/:taskId/status
router.patch(
  '/tasks/:taskId/status',
  authenticate,
  updateTaskStatus
);

// ---------------- API 19: Update Task ----------------
// PUT /api/tasks/:taskId
router.put(
  '/tasks/:taskId',
  authenticate,
  updateTask
);

module.exports = router;
