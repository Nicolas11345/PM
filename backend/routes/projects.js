const router = require('express').Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const AWS = require("aws-sdk");
const s3 = require('s3');
let Project = require('../models/project.model');
let User = require('../models/user.model');
let Task = require('../models/task.model');

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
    Project.find()
        .populate('users')
        .populate('tasks')
        .then(projects => res.json(projects))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/').post((req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const users = req.body.users;
    const tasks = req.body.tasks;

    const newProject = new Project({
        name,
        description,
        users,
        tasks,
    });

    newProject.save()
        .then(() => {
            User.find({ _id: { $in: req.body.users }, })
                .cursor()
                .eachAsync(async function (user) {
                    let notification = {
                        section : 'Projects',
                        message : 'You have been added to a new project : ' + req.body.name,
                        date : new Date(),
                    }
                    user.notifications.push(notification);
                    await user.save();
                })
            res.json('Project added!')
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
    Project.findById(req.params.id)
        .populate('users')
        .populate({
            path: 'tasks',
            populate: {path: 'project'},
        })
        .populate({
            path: 'tasks',
            populate: {path: 'submitter'},
        })
        .populate({
            path: 'tasks',
            populate: {path: 'assignee'},
        })
        .then(project => res.json(project))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/:id').post((req, res) => {
    Project.findById(req.params.id)
        .then(project => {
            project.name = req.body.name;
            project.description = req.body.description;
            project.users = req.body.users;
            project.tasks = req.body.tasks;
  
            project.save()
                .then(() => {
                    User.find({ _id: { $in: req.body.users }, })
                        .cursor()
                        .eachAsync(async function (user) {
                            let notification = {
                                section : 'Projects',
                                message : 'The project "' + req.body.name + '" has been edited',
                                date : new Date(),
                            }
                            user.notifications.push(notification);
                            await user.save();
                        })
                    res.json('Project updated!')
                })
                .catch(err => res.status(500).json('Error: ' + err));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});
  
router.route('/:id').delete((req, res) => {
    Task.find({ project: req.params.id, })
        .cursor()
        .eachAsync(async function (task) {
            try {
                let dir = path.join(__dirname, '../../storage', '/tasks/', String(task._id));

                if (fs.existsSync(dir)) {
                    let files = fs.readdirSync(dir);
                            
                    for (const file of files) {
                        fs.unlinkSync(path.join(dir, file));
                    }

                    fs.rmdirSync(dir);

                    let s3Params = {
                        Bucket: 'pm-app-storage',
                        Prefix: 'storage/tasks/' + String(task._id) + '/',
                    };
                    
                    let s3Deleter = s3Client.deleteDir(s3Params);
                    
                    s3Deleter.on('error', function(err) {
                        console.error('S3 Unable to sync:', err.stack);
                    });
                }

                Task.findByIdAndDelete(task._id)
                    .catch(err => res.status(500).json('Error: ' + err));
                    
            } catch(err) {
                console.log(err);
                res.status(500).json('Error: ' + err);
            }    
        })
        .then(() => {
            Project.findByIdAndDelete(req.params.id)
                .then(() => res.json('Project deleted.'))
                .catch(err => res.status(500).json('Error: ' + err));   
        })
});

module.exports = router;