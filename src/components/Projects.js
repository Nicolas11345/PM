import React from 'react';
import Axios from 'axios';
import ProjectPage from './utils/ProjectPage'
import ProjectDialog from './utils/ProjectDialog'
import { isEmpty } from '../utils'

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

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
            <IconButton component={Link} to={`${url}/${props.project._id}`}>
                <EditIcon />
            </IconButton>
        </Tooltip>
    );
}

export class Project extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            project : this.props.project
        }
    }
 
    render(){ 
        let users = this.state.project.users;
        users.sort((a,b) => {
            if(a.firstName < b.firstName) { return -1; }
            if(a.firstName > b.firstName) { return 1; }
            return 0;
        })

        users = users.map((user) => {
            return(
                <li key={user._id}> 
                    <Avatar alt={user.firstName} src={isEmpty(user.avatar) ? "" : `../../storage/users/${user._id}/${user.avatar}`}  
                        className="user-avatar" data-toggle="tooltip" data-placement="top" title={user.fullName} />
                </li>
            )
        });
        
        return(
            <Grid item xs={12} md={6}>
                <div className="app-card">
                    <div className="app-card-title">
                        <h2>{this.state.project.name}</h2>
                        <EditButton project = {this.state.project} />
                    </div>

                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <span>{this.state.project.description}</span>
                        </Grid>
                        <Grid item xs={12}>
                            <ul className="users-avatars">
                                {users}
                            </ul>
                        </Grid>
                    </Grid>
                </div>
            </Grid>
        );
    }
}

export class Projects extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            projects : [],
            dialogOpen : false
        }
    }

    componentDidMount(){
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        });
        this.getProjects();
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

    getProjects(){
        axios.get('/projects')
            .then(res => {
                if (res.data.length > 0) {
                    this.props.onChange();
                    this.setState({
                        projects : res.data,
                    });
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    addProject(project){
        axios.post('/projects', project)
            .then(res => {
                this.getProjects();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }
 
    render(){
        let { path, url } = this.props.match;

        let projects = this.state.projects;
        projects = projects.map((project) => <Project key = {project._id} project = {project} />);

        return(
            <Switch>
                <Route path={`${path}/:id`}>
                    <ProjectPage onChange = {() => this.getProjects()} />
                </Route>

                <Route exact path={path}>          
                    <div className="projects-add-button">
                        {this.props.user.role === "Administrator" ? ( 
                        <Button variant="contained" color="primary" className="primary-background-color" onClick={() => this.openDialog()}>
                            + New Project
                        </Button> ) : ""}

                        <ProjectDialog open = {this.state.dialogOpen} onAction = {(project) => this.addProject(project)} onClose = {() => this.closeDialog()} action = "add-project" />
                    </div>

                    <Grid container spacing={3}>
                        {projects}
                    </Grid> 
                </Route>
            </Switch>
        );
    }
}

export default withRouter(Projects);