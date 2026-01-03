const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  createProject,
  listProjects,
  updateProject,
  deleteProject
} = require('../controllers/project.controller');

// API 12: Create Project
router.post('/projects', authenticate, createProject);

// API 13: List Projects
router.get('/projects', authenticate, listProjects);

// API 14: Update Project
router.put('/projects/:projectId', authenticate, updateProject);

// API 15: Delete Project
router.delete('/projects/:projectId', authenticate, deleteProject);

module.exports = router;

