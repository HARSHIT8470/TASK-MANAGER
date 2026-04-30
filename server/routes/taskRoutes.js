const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createTask, getTasks, getTask,
  updateTask, deleteTask, getDashboardStats,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/tasks/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Tasks]
 */
router.get('/stats', protect, getDashboardStats);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a task (Admin only)
 *     tags: [Tasks]
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 */
router.route('/')
  .post(
    protect,
    adminOnly,
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('project').notEmpty().withMessage('Project ID is required'),
      body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
      body('priority').optional().isIn(['Low', 'Medium', 'High']),
    ],
    validate,
    createTask
  )
  .get(protect, getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get single task
 *     tags: [Tasks]
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *   delete:
 *     summary: Delete task (Admin only)
 *     tags: [Tasks]
 */
router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, adminOnly, deleteTask);

module.exports = router;
