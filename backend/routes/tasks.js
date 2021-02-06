const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const AWS = require("aws-sdk");
const s3 = require('s3');
let Task = require('../models/task.model');
let Project = require('../models/project.model');
let User = require('../models/user.model');

AWS.config.loadFromPath(path.join(__dirname, '../s3-config.json'));

let awsS3Client = new AWS.S3({apiVersion: '2006-03-01'});
let options = {
    s3Client: awsS3Client,
};
let s3Client = s3.createClient(options);

router.route('/favicon.ico').get((req, res) => { 
    res.status(204).end();
});

router.route('/').get((req, res) => {
    Task.find()
        .populate('project')
        .populate('submitter')
        .populate('assignee')
        .then(tasks => res.json(tasks))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/').post((req, res) => {
    const title = req.body.title;
    const project = req.body.project;
    const description = req.body.description;
    const submitter = req.body.submitter;
    const assignee = req.body.assignee;
    const priority = req.body.priority;
    const status = req.body.status;
    const created = req.body.created;
    const due = req.body.due;
    const comments = req.body.comments;
    const history = req.body.history;
    const files = req.body.files

    const newTask = new Task({
        title,
        project,
        description,
        submitter,
        assignee,
        priority,
        status,
        created,
        due,
        comments,
        history,
        files,
    });

    newTask.save()
        .then((task) => {
            Project.findById(task.project)
                .then(project => {
                    project.tasks.push(task._id)
        
                    project.save()
                        .then(() => {
                            User.findOne({ _id: req.body.assignee, })
                                .then(user => {
                                    let notification = {
                                        section : 'Tasks',
                                        message : 'You have been assigned a new task : ' + req.body.title,
                                        date : new Date(),
                                    }
                                    user.notifications.push(notification);

                                    user.save()
                                        .then(() => res.json('Task added!'))
                                        .catch(err => res.status(500).json('Error: ' + err));
                                })
                                .catch(err => res.status(500).json('Error: ' + err));
                        })
                        .catch(err => res.status(500).json('Error: ' + err));
                })
                .catch(err => res.status(500).json('Error: ' + err));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
    Task.findById(req.params.id)
        .populate('project')
        .populate('submitter')
        .populate('assignee')
        .populate({
            path: 'comments',
            populate: { path: 'commenter' }
        })
        .populate({
            path: 'files',
            populate: { path: 'uploader' }
        })
        .then(task => res.json(task))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/:id').post((req, res) => {
    Task.findById(req.params.id)
        .then(task => {
            task.title = req.body.title;
            task.project = req.body.project;
            task.description = req.body.description;
            task.submitter = req.body.submitter;
            task.assignee = req.body.assignee;
            task.priority = req.body.priority;
            task.status = req.body.status;
            task.created = req.body.created;
            task.due = req.body.due;
            task.comments = req.body.comments;
            task.history = req.body.history;
            task.files = req.body.files;
  
            task.save()
                .then(() => {
                    User.findOne({ _id: req.body.assignee, })
                        .then(user => {
                            let notification = {
                                section : 'Tasks',
                                message : 'The task "' + req.body.title + '" has been edited',
                                date : new Date(),
                            }
                            user.notifications.push(notification);

                            user.save()
                                .then(() => {
                                    if (req.body.submitter !== req.body.assignee) {
                                        User.find({ _id: req.body.submitter, })
                                            .then(users => {
                                                user = users[0];
                                                notification = {
                                                    section : 'Tasks',
                                                    message : 'The task "' + req.body.title + '" has been edited',
                                                    date : new Date(),
                                                }
                                                user.notifications.push(notification);

                                                user.save()
                                                    .then(() => res.json('Task updated!'))
                                                    .catch(err => res.status(500).json('Error: ' + err));
                                            })
                                            .catch(err => res.status(500).json('Error: ' + err));

                                    } else {
                                        res.json('Task updated!');
                                    }
                                })
                                .catch(err => res.status(500).json('Error: ' + err));
                        })
                        .catch(err => res.status(500).json('Error: ' + err));
                })
                .catch(err => res.status(500).json('Error: ' + err));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});
  
router.route('/:id').delete((req, res) => {
    Task.findById(req.params.id)
        .then((task) => {
            Project.findById(task.project)
                .then((project) => {
                    let taskIndex = project.tasks.findIndex(projectTask => String(projectTask) === String(task._id));
                    project.tasks.splice(taskIndex, 1);

                    project.save()
                        .then(() => {
                            try {
                                let dir = path.join(__dirname, '../../storage', '/tasks/', req.params.id);

                                if (fs.existsSync(dir)) {
                                    let files = fs.readdirSync(dir);
                            
                                    for (const file of files) {
                                        fs.unlinkSync(path.join(dir, file));
                                    }

                                    fs.rmdirSync(dir);

                                    let s3Params = {
                                        Bucket: 'pm-app-storage',
                                        Prefix: 'storage/tasks/' + req.params.id + '/',
                                    };
                                    
                                    let s3Deleter = s3Client.deleteDir(s3Params);
                                    
                                    s3Deleter.on('error', function(err) {
                                        console.error('S3 Unable to sync:', err.stack);
                                    });
                                }

                                Task.findByIdAndDelete(req.params.id)
                                    .then(() => res.json('Task deleted.'))
                                    .catch(err => res.status(500).json('Error: ' + err));

                            } catch(err) {
                                res.status(500).json('Error: ' + err);
                            }    
                        })
                        .catch(err => res.status(500).json('Error: ' + err));
                })
                .catch(err => res.status(500).json('Error: ' + err));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/user/:id').get((req, res) => {
    Task.find({ assignee: req.params.id, })
        .populate('project')
        .populate('submitter')
        .populate('assignee')
        .then(tasks => res.json(tasks))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/files/:id').post((req, res) => {
    Task.findById(req.params.id)
        .then(task => {
            let dir = path.join(__dirname, '../../storage', '/tasks/', req.params.id);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            let fileObject = req.files.file;
            let fileName = req.files.file.name

            fileObject.mv(dir + '/' + fileName, function(err) {
                if (err) {
                    return res.status(500).send(err);
                }
                
                let params = {
                    Bucket: 'pm-app-storage',
                    Key: 'storage/tasks/' + req.params.id + '/' + fileName,
                    Body: fileObject.data
                };

                awsS3Client.upload(params, function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`File uploaded successfully. ${data.Location}`);
                    }
                });

                let file = {
                    name : fileName,
                    uploader : req.body.uploader,
                    notes : req.body.notes,
                    date : req.body.date,
                }

                task.files.push(file);
    
                task.save()
                .then(() => {
                    User.findOne({ _id: req.body.assignee, })
                        .then(user => {
                            let notification = {
                                section : 'Tasks',
                                message : 'The task "' + req.body.title + '" has a new file',
                                date : new Date(),
                            }
                            user.notifications.push(notification);

                            user.save()
                                .then(() => {
                                    if (req.body.submitter !== req.body.assignee) {
                                        User.find({ _id: req.body.submitter, })
                                            .then(users => {
                                                user = users[0];
                                                notification = {
                                                    section : 'Tasks',
                                                    message : 'The task "' + req.body.title + '" has a new file',
                                                    date : new Date(),
                                                }
                                                user.notifications.push(notification);

                                                user.save()
                                                    .then(() => res.json('File added!'))
                                                    .catch(err => res.status(500).json('Error: ' + err));
                                            })
                                            .catch(err => res.status(500).json('Error: ' + err));

                                    } else {
                                        res.json('File added!');
                                    }
                                })
                                .catch(err => res.status(500).json('Error: ' + err));
                        })
                        .catch(err => res.status(500).json('Error: ' + err));
                })
                .catch(err => res.status(500).json('Error: ' + err));
            });
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/files/:id').put((req, res) => {
    let filePath = path.join(__dirname, '../../storage', '/tasks/', req.params.id, '/', req.body.name);

    try {
        fs.unlink(filePath, function(err) {
            if (err) {
                return res.status(500).send(err);
            }

            let params = {
                Bucket: 'pm-app-storage',
                Key: 'storage/tasks/' + req.params.id + '/' + req.body.name,
            };

            awsS3Client.deleteObject(params, function(err) {
                if (err) console.log(err, err.stack);
            });
        });

        res.json('File deleted.');
    } catch(err) {
        res.status(500).json('Error: ' + err);
    }
});

module.exports = router;