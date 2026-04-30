const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login, getMe, getAllUsers } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [Admin, Member] }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Email already exists }
 */
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['Admin', 'Member']).withMessage('Role must be Admin or Member'),
  ],
  validate,
  signup
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);
router.get('/users', protect, adminOnly, getAllUsers);

module.exports = router;
