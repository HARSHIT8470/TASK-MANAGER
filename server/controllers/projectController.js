const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc  Create project
// @route POST /api/projects
// @access Private/Admin
const createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || [],
    });
    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email role');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all projects (Admin sees all, Member sees assigned)
// @route GET /api/projects
// @access Private
const getProjects = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (req.user.role !== 'Admin') {
      query.members = req.user._id;
    }
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    res.json({ projects, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single project
// @route GET /api/projects/:id
// @access Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Members can only view projects they belong to
    if (
      req.user.role !== 'Admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update project
// @route PUT /api/projects/:id
// @access Private/Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { title, description, members, status } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (members) project.members = members;
    if (status) project.status = status;

    await project.save();
    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete project
// @route DELETE /api/projects/:id
// @access Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Delete all tasks in the project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();
    res.json({ message: 'Project and all associated tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Add member to project
// @route PUT /api/projects/:id/members
// @access Private/Admin
const addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { userId } = req.body;
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User already a member' });
    }
    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Remove member from project
// @route DELETE /api/projects/:id/members/:userId
// @access Private/Admin
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('members', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
