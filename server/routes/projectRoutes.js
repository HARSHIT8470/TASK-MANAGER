const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createProject, getProjects, getProject,
  updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a project (Admin only)
 *     tags: [Projects]
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 */
router.route('/')
  .post(
    protect,
    adminOnly,
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('description').optional().trim(),
    ],
    validate,
    createProject
  )
  .get(protect, getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get single project
 *     tags: [Projects]
 *   put:
 *     summary: Update project (Admin only)
 *     tags: [Projects]
 *   delete:
 *     summary: Delete project (Admin only)
 *     tags: [Projects]
 */
router.route('/:id')
  .get(protect, getProject)
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

// Member management
router.put('/:id/members', protect, adminOnly, addMember);
router.delete('/:id/members/:userId', protect, adminOnly, removeMember);

module.exports = router;
