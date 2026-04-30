const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc  Create task
// @route POST /api/tasks
// @access Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title, description, project, assignedTo, status, priority, dueDate,
      createdBy: req.user._id,
    });

    await task.populate('project', 'title');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all tasks with filters
// @route GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  try {
    const { project, status, assignedTo, priority, search, page = 1, limit = 20 } = req.query;
    let query = {};

    // Members only see tasks assigned to them
    if (req.user.role !== 'Admin') {
      query.assignedTo = req.user._id;
    }

    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo && req.user.role === 'Admin') query.assignedTo = assignedTo;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('project', 'title')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(query),
    ]);

    res.json({ tasks, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single task
// @route GET /api/tasks/:id
// @access Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title members')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only see tasks assigned to them
    if (
      req.user.role !== 'Admin' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update task
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only update status of their own tasks
    if (req.user.role === 'Member') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      task.status = req.body.status || task.status;
    } else {
      // Admin can update all fields
      const { title, description, assignedTo, status, priority, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
    }

    await task.save();
    await task.populate('project', 'title');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete task
// @route DELETE /api/tasks/:id
// @access Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get dashboard stats
// @route GET /api/tasks/stats
// @access Private
const getDashboardStats = async (req, res) => {
  try {
    let taskQuery = {};
    if (req.user.role !== 'Admin') {
      taskQuery.assignedTo = req.user._id;
    }

    const now = new Date();
    const [total, completed, inProgress, toDo, overdue] = await Promise.all([
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'Done' }),
      Task.countDocuments({ ...taskQuery, status: 'In Progress' }),
      Task.countDocuments({ ...taskQuery, status: 'To Do' }),
      Task.countDocuments({
        ...taskQuery,
        dueDate: { $lt: now },
        status: { $ne: 'Done' },
      }),
    ]);

    res.json({ total, completed, inProgress, toDo, overdue, pending: total - completed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getDashboardStats };
