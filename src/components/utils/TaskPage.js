import React from 'react';
import Axios from 'axios';
import TaskDialog from './TaskDialog';
import { isEmpty, formatDate } from '../../utils'

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteIcon from '@material-ui/icons/Delete';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';

import {
    Link,
    withRouter
} from "react-router-dom";

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

class TaskInfo extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            dialogOpen : false
        }
    }

    openDialog(){
        this.setState({
            dialogOpen : true
        });
    }
  
    closeDialog(){
        this.setState({
            dialogOpen : false
        });
    }

    editTask(task){
        axios.post('/tasks/' + task._id, task)
            .then(res => {
                this.props.onChange();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        let task = this.props.task || {};
        let title = task.title || "";
        let project = task.project || {};
        let description = task.description || "";
        let submitter = task.submitter || {};
        let assignee = task.assignee || {};
        let priority = task.priority || "";
        let status = task.status || "";
        let created = task.created || {};
        let due = task.due || {};

        return(
            <Grid item xs={12} md={6}>
                <div className="app-card">
                    <div className="app-card-title">
                        <h2>Task Info</h2>
                        <Tooltip title="Edit">
                            <IconButton onClick={() => this.openDialog()}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>

                        <TaskDialog open = {this.state.dialogOpen} task = {this.props.task} 
                            onAction = {(task) => this.editTask(task)} onClose = {() => this.closeDialog()} action = "edit-task" />
                    </div>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Title</h3>
                                <span>{title}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Project</h3>
                                <span>{project.name}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <div className="app-card-text">
                                <h3>Description</h3>
                                <span>{description}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Submitter</h3>
                                <span>{submitter.fullName}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Assignee</h3>
                                <span>{assignee.fullName}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Priority</h3>
                                <span>{priority}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Status</h3>
                                <span>{status}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Created</h3>
                                <span>{formatDate(created)}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Due</h3>
                                <span>{formatDate(due)}</span>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </Grid>

        );
    }
}

class TaskComments extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            message : "",
            dialogOpen : false,
            page : 0,
            rowsPerPage : 5
        }
    }

    openDialog(){
        this.setState({
            dialogOpen : true
        });
    }
  
    closeDialog(){
        this.setState({
            message : "",
            dialogOpen : false
        });
    }

    changePage(event, page){
        this.setState({
            page : page
        });
    }

    changeRowsPerPage(event){
        let rowsPerPage = event.target.value;
        this.setState({
            rowsPerPage : rowsPerPage
        });
    }

    changeMessage(event){
        this.setState({
            message : event.target.value
        })
    }

    addComment(){
        if (isEmpty(this.state.message)) {
            alert("Please write a comment");
            return;
        }
        let task = this.props.task;
        let user = this.props.user || {};
        let comment = {};
        comment.commenter = user._id;
        comment.message = this.state.message;
        comment.created = new Date();
        task.comments.push(comment);
        task.submitter = task.assignee._id;
        task.assignee = task.assignee._id;

        this.editTask(task);
        setTimeout(() => this.closeDialog(), 750);  
    }

    deleteComment(comment){
        let task = this.props.task;
        let comments = task.comments
        let commentIndex = comments.findIndex((commentItem) => commentItem._id === comment._id);
        comments.splice(commentIndex, 1);
        task.comments = comments;
        task.submitter = task.assignee._id;
        task.assignee = task.assignee._id;

        this.editTask(task);
    }

    editTask(task){
        axios.post('/tasks/' + task._id, task)
            .then(res => {
                this.props.onChange();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        let comments = this.props.task.comments || [];
        let count = comments.length;
        let page = this.state.page;
        let rowsPerPage = this.state.rowsPerPage;

        let commentsReversed = [];
        for (let i=comments.length-1; i>=0; i--) {
            commentsReversed.push(comments[i]);
        }
        comments = commentsReversed;

        comments = comments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((comment) => {
            return(
                <TableRow hover={true} key={comment._id}>
                    <TableCell style={{ width: "25%", }}>{comment.commenter.fullName}</TableCell>
                    <TableCell style={{ width: "40%", }}>{comment.message}</TableCell>
                    <TableCell style={{ width: "25%", }}>{formatDate(comment.created)}</TableCell>
                    <TableCell style={{ width: "10%", }}>
                        <Tooltip title="Delete">
                            <IconButton onClick={() => this.deleteComment(comment)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            )
        });
        
        return(
            <Grid item xs={12} md={6}>
                <div className="app-card">
                    <div className="app-card-title">
                        <h2>Task Comments</h2>
                        <Button variant="contained" color="primary" className="primary-background-color" onClick={() => this.openDialog()}>
                            + New Comment
                        </Button>

                        <Dialog open={this.state.dialogOpen} onClose={() => this.closeDialog()}>
                            <DialogTitle>Add Comment</DialogTitle>
                                    
                            <DialogContent>
                                <TextField margin="dense" id="task-comment-input" label="Comment" autoComplete={"off"} 
                                    onChange={(event) => this.changeMessage(event)} fullWidth />
                            </DialogContent>
                                
                            <DialogActions>
                                <Button onClick={() => this.closeDialog()} className="primary-color">
                                    Cancel
                                </Button>
                                <Button onClick={() => this.addComment()} className="primary-color">
                                    Add
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>

                    <TableContainer>
                        <Table className="task-page-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ width: "25%", }}>Commenter</TableCell>
                                    <TableCell style={{ width: "40%", }}>Message</TableCell>
                                    <TableCell style={{ width: "25%", }}>Created</TableCell>
                                    <TableCell style={{ width: "10%", }}></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {comments}
                            </TableBody>

                            <TableFooter>
                                <TableRow>
                                    <TablePagination rowsPerPageOptions={[5, 10, 25]} count={count}
                                        rowsPerPage={rowsPerPage} page={page}
                                        onChangePage={(event, page) => this.changePage(event, page)} 
                                        onChangeRowsPerPage={(event) => this.changeRowsPerPage(event)} />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </div>
            </Grid>
        );
    }
}

class TaskHistory extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            page : 0,
            rowsPerPage : 5
        }
    }

    changePage(event, page){
        this.setState({
            page : page
        });
    }

    changeRowsPerPage(event){
        let rowsPerPage = event.target.value;
        this.setState({
            rowsPerPage : rowsPerPage
        });
    }

    render(){
        let history = this.props.task.history|| [];
        let count = history.length;
        let page = this.state.page;
        let rowsPerPage = this.state.rowsPerPage;
        
        let historyReversed = [];
        for (let i=history.length-1; i>=0; i--) {
            historyReversed.push(history[i]);
        }
        history = historyReversed;

        history = history.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((historyItem) => {
            return(
                <TableRow hover={true} key={historyItem._id}>
                    <TableCell style={{ width: "25%", }}>{historyItem.property}</TableCell>
                    <TableCell style={{ width: "25%", }}>{historyItem.old}</TableCell>
                    <TableCell style={{ width: "25%", }}>{historyItem.new}</TableCell>
                    <TableCell style={{ width: "25%", }}>{formatDate(historyItem.date)}</TableCell>
                </TableRow>
            )
        });

        return(
            <Grid item xs={12} md={6}>
                <div className="app-card">
                    <div className="app-card-title">
                        <h2>Task History</h2>
                    </div>

                    <TableContainer>
                        <Table className="task-page-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ width: "25%", }}>Property</TableCell>
                                    <TableCell style={{ width: "25%", }}>Old</TableCell>
                                    <TableCell style={{ width: "25%", }}>New</TableCell>
                                    <TableCell style={{ width: "25%", }}>Date</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {history}
                            </TableBody>

                            <TableFooter>
                                <TableRow>
                                    <TablePagination rowsPerPageOptions={[5, 10, 25]} count={count}
                                        rowsPerPage={rowsPerPage} page={page}
                                        onChangePage={(event, page) => this.changePage(event, page)} 
                                        onChangeRowsPerPage={(event) => this.changeRowsPerPage(event)} />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </div>
            </Grid>
        );
    }
}

class TaskFiles extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            file : {},
            fileName : "No file",
            dialogOpen : false,
            page : 0,
            rowsPerPage : 5
        }
    }

    openDialog(){
        this.setState({
            dialogOpen : true
        });
    }
  
    closeDialog(){
        this.setState({
            dialogOpen : false
        });
    }

    changePage(event, page){
        this.setState({
            page : page
        });
    }

    changeRowsPerPage(event){
        let rowsPerPage = event.target.value;
        this.setState({
            rowsPerPage : rowsPerPage
        });
    }

    handleFile(){
        let file = $("#task-file-input").prop('files')[0];

        if (!file){
            return;
        }

        this.setState({
            file : file,
            fileName : file.name
        })
    }

    uploadFile(){
        if (this.state.fileName === "No file"){
            alert("Please select a file");
            return;
        }

        let task = this.props.task || {};
        let user = this.props.user || {};
        let uploader = user._id;
        let notes =  $("#task-file-notes").val();
        let date = new Date(); 
        
        if (isEmpty(notes)) {
            alert("Please add a note");
            return;
        }

        let formData = new FormData();
        formData.append('file', this.state.file);
        formData.append('uploader', uploader);
        formData.append('notes', notes);
        formData.append('date', date);
        formData.append('title', task.title);
        formData.append('submitter', task.submitter._id);
        formData.append('assignee', task.assignee._id);

        axios.post('/tasks/files/' + task._id, formData)
            .then(res => {
                this.props.onChange();
                setTimeout(() => this.closeDialog(), 250);
                setTimeout(() => this.setState({
                        file : {},
                        fileName : "No file"
                    }), 250);
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    deleteFile(file){
        let task = this.props.task;
        let files = task.files
        let fileIndex = files.findIndex((fileItem) => fileItem._id === file._id);
        files.splice(fileIndex, 1);
        task.files = files;

        axios.put('/tasks/files/' + task._id, file)
            .then(res => {
                task.submitter = task.assignee._id;
                task.assignee = task.assignee._id;
                this.editTask(task); 
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    editTask(task){
        axios.post('/tasks/' + task._id, task)
            .then(res => {
                this.props.onChange();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        let files = this.props.task.files || [];
        let count = files.length;
        let page = this.state.page;
        let rowsPerPage = this.state.rowsPerPage;

        let filesReversed = [];
        for (let i=files.length-1; i>=0; i--) {
            filesReversed.push(files[i]);
        }
        files = filesReversed;

        files = files.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((file) => {
            return(
                <TableRow hover={true} key={file._id}>
                    <TableCell style={{ width: "25%", }}>
                        <a href={`../storage/tasks/${this.props.task._id}/${file.name}`} download>{file.name}</a>
                    </TableCell>
                    <TableCell style={{ width: "20%", }}>{file.uploader.fullName}</TableCell>
                    <TableCell style={{ width: "35%", }}>{file.notes}</TableCell>
                    <TableCell style={{ width: "20%", }}>{formatDate(file.date)}</TableCell>
                    <TableCell style={{ width: "10%", }}>
                        <Tooltip title="Delete">
                            <IconButton onClick={() => this.deleteFile(file)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            )
        });

        return(
            <Grid item xs={12} md={6}>
                <div className="app-card">
                    <div className="app-card-title">
                        <h2>Task Files</h2>
                        <Button variant="contained" color="primary" className="primary-background-color" onClick={() => this.openDialog()}>
                            + New File
                        </Button>

                        <Dialog open={this.state.dialogOpen} onClose={() => this.closeDialog()}>
                            <DialogTitle>Add File</DialogTitle>
                                    
                            <DialogContent>
                                <div>
                                    <input type="file" id="task-file-input" className="upload" onChange = {() => this.handleFile()}></input>
                                    <label htmlFor="task-file-input">
                                        <Button variant="contained" color="primary" className="primary-background-color" component="span">
                                            Choose File
                                        </Button>
                                    </label>
                                    <span style={{ marginLeft: "0.5rem", }}>{this.state.fileName} selected</span>
                                </div>

                                <TextField margin="dense" id="task-file-notes" label="Notes" autoComplete={"off"} fullWidth />
                            </DialogContent>
                                
                            <DialogActions>
                                <Button onClick={() => this.closeDialog()} className="primary-color">
                                    Cancel
                                </Button>
                                <Button onClick={() => this.uploadFile()} className="primary-color">
                                    Add
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>

                    <TableContainer>
                        <Table className="task-page-table-files">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ width: "25%", }}>File</TableCell>
                                    <TableCell style={{ width: "20%", }}>Uploader</TableCell>
                                    <TableCell style={{ width: "35%", }}>Notes</TableCell>
                                    <TableCell style={{ width: "20%", }}>Date</TableCell>
                                    <TableCell style={{ width: "10%", }}></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {files}
                            </TableBody>

                            <TableFooter>
                                <TableRow>
                                    <TablePagination rowsPerPageOptions={[5, 10, 25]} count={count}
                                        rowsPerPage={rowsPerPage} page={page}
                                        onChangePage={(event, page) => this.changePage(event, page)} 
                                        onChangeRowsPerPage={(event) => this.changeRowsPerPage(event)} />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </div>
            </Grid>
        );
    }
}

class TaskPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user : {},
            task : {},
            dialogOpen : false
        };
    }

    componentDidMount(){
        this.getUser();
        this.getTask();
    }

    openDialog(){
        this.setState({
            dialogOpen : true
        });
    }
  
    closeDialog(){
        this.setState({
            dialogOpen : false
        });
    }

    getUser(){
        axios.get('/users/session')
            .then(res => {
                if (!isEmpty(res.data)) {
                    this.setState({
                        user : res.data,
                    });
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    getTask(){
        axios.get('/tasks/' + this.props.match.params.id)
            .then(res => {
                this.props.onChange();
                this.setState({
                    task : res.data,
                });
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    deleteTask(){
        let task = this.state.task;

        axios.delete('/tasks/' + task._id)
            .then(res => {
                this.closeDialog();
                window.location.reload();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }
 
    render(){
        return(
            <div>
                <div className="task-page-title">
                    <Tooltip title="Back">
                        <IconButton component={Link} to={this.props.previousPage}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <h2>{this.state.task.title}</h2>
                </div>

                <Grid container spacing={4}>
                    <TaskInfo task = {this.state.task} onChange = {() => this.getTask()} />
                    <TaskComments user = {this.state.user} task = {this.state.task} onChange = {() => this.getTask()} />
                    <TaskHistory task = {this.state.task} onChange = {() => this.getTask()} />
                    <TaskFiles user = {this.state.user} task = {this.state.task} onChange = {() => this.getTask()} />

                    <Grid item xs={12}>
                        <Button variant="contained" color="secondary" onClick={() => this.openDialog()}>
                            Delete Task
                        </Button>

                        <Dialog open={this.state.dialogOpen} onClose = {() => this.closeDialog()}>
                            <DialogTitle>Delete Task</DialogTitle>
                                
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to delete the task?
                                </DialogContentText>
                            </DialogContent>

                            <DialogActions>
                                <Button onClick={() => this.closeDialog()} className="primary-color">
                                    No
                                </Button>
                                    
                                <Button onClick={() => this.deleteTask()} className="primary-color">
                                    Yes
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withRouter(TaskPage);