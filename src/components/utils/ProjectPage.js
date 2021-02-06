import React from 'react';
import Axios from 'axios';
import ProjectDialog from './ProjectDialog'
import TaskDialog from './TaskDialog'
import TaskPage from './TaskPage'
import { isEmpty, formatDate } from '../../utils'

import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
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
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    withRouter
} from "react-router-dom";

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

function EditButton(props) {
    let { path, url } = useRouteMatch();
    return(
        <Tooltip title="Edit">
            <IconButton component={Link} to={`${url}/tasks/${props.task._id}`}>
                <EditIcon />
            </IconButton>
        </Tooltip>
    );
}

class ProjectInfo extends React.Component{
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

    editProject(project){
        axios.post('/projects/' + project._id, project)
            .then(res => {
                this.props.onChange();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        return(
            <Grid item xs={12} md={6}>
                <div className="app-card">
                    <div className="app-card-title">
                        <h2>Project Info</h2>
                        <Tooltip title="Edit">
                            <IconButton onClick={() => this.openDialog()}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>

                        <ProjectDialog open = {this.state.dialogOpen} project = {this.props.project} 
                            onAction = {(project) => this.editProject(project)} onClose = {() => this.closeDialog()} action = "edit-info" />
                    </div>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Project Name</h3>
                                <span>{this.props.project.name}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="app-card-text">
                                <h3>Project Description</h3>
                                <span>{this.props.project.description}</span>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </Grid>
        );
    }
}

class ProjectUsers extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            dialogOpen : false
        }
    }

    componentDidUpdate(){
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        });
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

    editProject(project){
        axios.post('/projects/' + project._id, project)
            .then(res => {
                this.props.onChange();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        let users = this.props.project.users || [];
        users.sort((a,b) => {
            if(a.firstName < b.firstName) { return -1; }
            if(a.firstName > b.firstName) { return 1; }
            return 0;
        })

        users = users.map((user) => {
            if (!isEmpty(user._id)) {
                return(
                    <li key={user._id}> 
                        <Avatar alt={user.firstName} src={isEmpty(user.avatar) ? "" : `../../../storage/users/${user._id}/${user.avatar}`}  
                            className="user-avatar" data-toggle="tooltip" data-placement="top" title={user.fullName} />
                    </li>
                )
            }
        });

        return(
            <Grid item xs={12} md={6}>
                <div className="app-card">
                    <div className="app-card-title">
                        <h2>Project Users</h2>
                        <Tooltip title="Edit">
                            <IconButton onClick={() => this.openDialog()}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>

                        <ProjectDialog open = {this.state.dialogOpen} project = {this.props.project}
                            onAction = {(project) => this.editProject(project)} onClose = {() => this.closeDialog()} action = "edit-users" />
                    </div>

                    <ul className="users-avatars">
                        {users}
                    </ul>
                </div>
            </Grid>
        );
    }
}

class ProjectTasks extends React.Component{
    constructor(props){
        super(props);
        this.state = {
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

    addTask(task){
        axios.post('/tasks', task)
            .then(res => {
                this.props.onChange();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        let tasks = this.props.project.tasks || [];
        let count = tasks.length;
        let page = this.state.page;
        let rowsPerPage = this.state.rowsPerPage;

        tasks = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task) => {
            return(
                <TableRow hover={true} key={task._id}>
                    <TableCell style={{ width: "16%", }}>{task.title}</TableCell>
                    <TableCell align="right" style={{ width: "13%", }}>{task.submitter.fullName}</TableCell>
                    <TableCell align="right" style={{ width: "13%", }}>{task.assignee.fullName}</TableCell>
                    <TableCell align="right" style={{ width: "13%", }}>{task.priority}</TableCell>
                    <TableCell align="right" style={{ width: "13%", }}>{task.status}</TableCell>
                    <TableCell align="right" style={{ width: "13%", }}>{formatDate(task.created)}</TableCell>
                    <TableCell align="right" style={{ width: "13%", }}>{formatDate(task.due)}</TableCell>
                    <TableCell align="right" style={{ width: "6%", }}>
                        <EditButton task={task} />
                    </TableCell>
                </TableRow>
            )
        });

        return(
            <Grid item xs={12}>
                <div className="app-card">
                    <div className="app-card-title">
                        <h2>Project Tasks</h2>
                        <Button variant="contained" color="primary" className="primary-background-color" onClick={() => this.openDialog()}>
                            + New Task
                        </Button>

                        <TaskDialog open = {this.state.dialogOpen} project = {this.props.project}
                            onAction = {(task) => this.addTask(task)} onClose = {() => this.closeDialog()} action="add-task" />
                    </div>

                    <TableContainer>
                        <Table className="tasks-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ width: "16%", }}>Title</TableCell>
                                    <TableCell align="right" style={{ width: "13%", }}>Submitter</TableCell>
                                    <TableCell align="right" style={{ width: "13%", }}>Assignee</TableCell>
                                    <TableCell align="right" style={{ width: "13%", }}>Priority</TableCell>
                                    <TableCell align="right" style={{ width: "13%", }}>Status</TableCell>
                                    <TableCell align="right" style={{ width: "13%", }}>Created</TableCell>
                                    <TableCell align="right" style={{ width: "13%", }}>Due</TableCell>
                                    <TableCell style={{ width: "6%", }}></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {tasks}                            
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

class ProjectPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            project : {},
            dialogOpen : false
        }
    }

    componentDidMount(){
        this.getProject()
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

    getProject(){
        axios.get('/projects/' + this.props.match.params.id)
            .then(res => {
                this.props.onChange();
                this.setState({
                    project : res.data,
                });
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    deleteProject(){
        let project = this.state.project;

        axios.delete('/projects/' + project._id)
            .then(res => {
                this.closeDialog();
                window.location.reload();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }
 
    render(){
        let { path, url } = this.props.match;

        return(
            <Switch>
                <Route path={`${path}/tasks/:id`}>
                    <TaskPage previousPage = {url} onChange = {() => this.getProject()} />
                </Route>

                <Route exact path={path}>  
                    <div className="project-page-title">
                        <Tooltip title="Back">
                            <IconButton component={Link} to="/projects">
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                        <h2>{this.state.project.name}</h2>
                    </div>

                    <Grid container spacing={4}>
                        <ProjectInfo project = {this.state.project} onChange = {() => this.getProject()} />
                        <ProjectUsers project = {this.state.project} onChange = {() => this.getProject()} />
                        <ProjectTasks project = {this.state.project} onChange = {() => this.getProject()} />

                        <Grid item xs={12}>
                            <Button variant="contained" color="secondary" onClick={() => this.openDialog()}>
                                Delete Project
                            </Button>

                            <Dialog open={this.state.dialogOpen} onClose = {() => this.closeDialog()}>
                                <DialogTitle>Delete Project</DialogTitle>
                                    
                                <DialogContent>
                                    <DialogContentText>
                                        Are you sure you want to delete the project?
                                    </DialogContentText>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={() => this.closeDialog()} className="primary-color">
                                        No
                                    </Button>
                                        
                                    <Button onClick={() => this.deleteProject()} className="primary-color">
                                        Yes
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Grid>
                    </Grid>
                </Route>
            </Switch>
        );
    }
}

export default withRouter(ProjectPage);