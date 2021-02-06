import React from 'react';
import Axios from 'axios';
import { isEmpty } from '../../utils'

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

class TaskDialog extends React.Component{
    constructor(props){
        super(props);
        let task = {};
        task.due = new Date();
        let users = [];
        if (this.props.action === "add-task" && !isEmpty(this.props.project)) {
            users = this.props.project.users;
        }
        this.state = {
            task : task,
            users : users,
            isChanged : {
                title : false,
                description : false,
                assignee : false,
                priority : false,
                status : false,
                due : false,
            }
        }
    }

    componentDidUpdate(prevProps){   
        if (this.props.project != prevProps.project) {
            if (this.props.action === "add-task") {
                this.setState({
                    users : this.props.project.users
                })
            }
        } else if (this.props.task != prevProps.task) {
            if (this.props.action === "edit-task") {
                axios.get('/projects/' + this.props.task.project._id)
                    .then(res => {
                        let project = res.data;
                        let task = Object.assign({}, this.props.task);
                        task.assignee = task.assignee._id;
                        this.setState({
                            task : task,
                            users : project.users
                        });
                    })
                    .catch(err => {
                        console.log("Something went wrong!", err);
                    })
            }
        }
    }

    changeTitle(event){
        let task = this.state.task;
        task.title = event.target.value;

        let isChanged = this.state.isChanged;
        isChanged.title = true;

        this.setState({
            task : task,
            isChanged : isChanged
        })
    }

    changeDescription(event){
        let task = this.state.task;
        task.description = event.target.value;

        let isChanged = this.state.isChanged;
        isChanged.description = true;

        this.setState({
            task : task,
            isChanged : isChanged
        })
    }

    changeAssignee(event){
        let task = this.state.task;
        task.assignee = event.target.value;

        let isChanged = this.state.isChanged;
        isChanged.assignee = true;

        this.setState({
            task : task,
            isChanged : isChanged
        })
    }

    changePriority(event){
        let task = this.state.task;
        task.priority = event.target.value;

        let isChanged = this.state.isChanged;
        isChanged.priority = true;

        this.setState({
            task : task,
            isChanged : isChanged
        })
    }

    changeStatus(event){
        let task = this.state.task;
        task.status = event.target.value;

        let isChanged = this.state.isChanged;
        isChanged.status = true;

        this.setState({
            task : task,
            isChanged : isChanged
        })
    }

    changeDueDate(date){
        let task = this.state.task;
        task.due = date;

        let isChanged = this.state.isChanged;
        isChanged.due = true;

        this.setState({
            task : task,
            isChanged : isChanged
        })
    }

    handleAction(){
        if (isEmpty(this.state.task.title) || isEmpty(this.state.task.description) || isEmpty(this.state.task.assignee) 
            || isEmpty(this.state.task.priority) || isEmpty(this.state.task.status)) {
                alert("Please fill in all the fields");
                return;
        }

        if (this.props.action === "edit-task"){
            let task = this.props.task;            
            if (this.state.isChanged.due) {
                task.history.push({
                    property : "Due",
                    old : task.due,
                    new : this.state.task.due,
                    date : new Date(),
                })
            }
            task.due = this.state.task.due;

            if (this.state.isChanged.status) {
                task.history.push({
                    property : "Status",
                    old : task.status,
                    new : this.state.task.status,
                    date : new Date(),
                })
            }
            task.status = this.state.task.status;

            if (this.state.isChanged.priority) {
                task.history.push({
                    property : "Priority",
                    old : task.priority,
                    new : this.state.task.priority,
                    date : new Date(),
                })
            }
            task.priority = this.state.task.priority;

            if (this.state.isChanged.assignee) {
                task.history.push({
                    property : "Assignee",
                    old : task.assignee.fullName,
                    new : this.state.users.find((user) => user._id === this.state.task.assignee).fullName,
                    date : new Date(),
                })
            }
            task.assignee = this.state.task.assignee;

            if (this.state.isChanged.description) {
                task.history.push({
                    property : "Description",
                    old : task.description,
                    new : this.state.task.description,
                    date : new Date(),
                })
            }
            task.description = this.state.task.description;

            if (this.state.isChanged.title) {
                task.history.push({
                    property : "Title",
                    old : task.title,
                    new : this.state.task.title,
                    date : new Date(),
                })
            }
            task.title = this.state.task.title;

            task.project = task.project._id;
            task.submitter = task.submitter._id;

            this.props.onAction(task);
            this.props.onClose();
            
        } else if (this.props.action === "add-task") {
            axios.get('/users/session')
            .then(res => {
                let task = this.state.task;
                task.project = this.props.project._id;
                task.submitter = res.data._id;
                task.created = new Date();

                this.props.onAction(task);
                this.props.onClose();

                let taskEmpty = {};
                taskEmpty.due = new Date();
                this.setState({
                    task: taskEmpty,
                })
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
        }
    }
 
    render(){
        let users = this.state.users || [];
        users = users.map((user) => <MenuItem key={user._id} value={user._id}>{user.fullName}</MenuItem>);

        return(
            <Dialog open={this.props.open} onClose={() => this.props.onClose()}>
                <DialogTitle>{this.props.action === "add-task" ? "Add Task" : "Edit Task"}</DialogTitle>
                        
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField margin="dense" id="task-title-input" label="Title" autoComplete={"off"} 
                                defaultValue={this.state.task.title} 
                                onChange={(event) => this.changeTitle(event)} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField margin="dense" id="task-description-input" label="Description" autoComplete={"off"}
                                defaultValue={this.state.task.description} 
                                onChange={(event) => this.changeDescription(event)} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Assignee</InputLabel>
                                <Select id="task-assignee-select" value={this.state.task.assignee || ""} label="Assignee"
                                    onChange={(event) => this.changeAssignee(event)}>
                                    {users}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select id="task-priority-select" value={this.state.task.priority || ""} label="Priority"
                                    onChange={(event) => this.changePriority(event)}>
                                    <MenuItem value={"Low"}>Low</MenuItem>
                                    <MenuItem value={"Normal"}>Normal</MenuItem>
                                    <MenuItem value={"High"}>High</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select id="task-status-select" value={this.state.task.status || ""} label="Status"
                                    onChange={(event) => this.changeStatus(event)}>
                                    <MenuItem value={"In Progress"}>In Progress</MenuItem>
                                    <MenuItem value={"Late"}>Late</MenuItem>
                                    <MenuItem value={"Done"}>Done</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker disableToolbar variant="inline" format="MM/dd/yyyy" margin="normal"
                                    id="task-date-picker" label="Due Date" value={this.state.task.due} onChange={(date) => this.changeDueDate(date)} 
                                    style={{ marginTop: "0", }}  /> 
                            </MuiPickersUtilsProvider>
                        </Grid>
                    </Grid>                    
                </DialogContent>
                    
                <DialogActions>
                    <Button onClick={() => this.props.onClose()} className="primary-color">
                        Cancel
                    </Button>
                    <Button onClick={() => this.handleAction()} className="primary-color">
                        {this.props.action === "add-task" ? "Add" : "Edit"}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default TaskDialog;