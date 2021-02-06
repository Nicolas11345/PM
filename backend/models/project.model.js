const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    tasks: [{
        type: [Schema.Types.ObjectId],
        ref: 'Task',
        required: true,
    }],
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;