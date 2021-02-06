const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    commenter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true,
    },
    message: {
        type: String,
        required: true,
        immutable: true,
    },
    created: {
        type: Date,
        required: true,
        immutable: true,
    },
})

const historySchema = new Schema({
    property: {
        type: String,
        required: true,
        immutable: true,
    },
    old: {
        type: String,
        required: true,
        immutable: true,
    },
    new: {
        type: String,
        required: true,
        immutable: true,
    },
    date: {
        type: Date,
        required: true,
        immutable: true,
    },
})

const fileSchema = new Schema({
    name: {
        type: String,
        required: true,
        immutable: true,
    },
    uploader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true,
    },
    notes: {
        type: String,
        required: true,
        immutable: true,
    },
    date: {
        type: Date,
        required: true,
        immutable: true,
    },
})

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    submitter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true,
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    priority: {
        type: String,
        required: true,
        trim: true,
        default: 'Normal',
        enum: ['Low', 'Normal', 'High'],
    },
    status: {
        type: String,
        required: true,
        trim: true,
        default: 'In Progress',
        enum: ['In Progress', 'Late', 'Done'],
    },
    created: {
        type: Date,
        required: true,
        immutable: true,
    },
    due: {
        type: Date,
        required: true,
    },
    comments: [commentSchema],
    history: [historySchema],
    files: [fileSchema],
}, {
    timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;