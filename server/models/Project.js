const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

// Automatically include the creator as a member
projectSchema.pre('save', function (next) {
  if (this.isNew) {
    const creatorId = this.createdBy.toString();
    const alreadyMember = this.members.some((m) => m.toString() === creatorId);
    if (!alreadyMember) {
      this.members.push(this.createdBy);
    }
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
