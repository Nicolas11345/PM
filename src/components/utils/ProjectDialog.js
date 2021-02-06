import React from 'react';
import Axios from 'axios';
import { isEmpty } from '../../utils'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

class ProjectDialog extends React.Component{
    constructor(props){
        super(props);
        let project = {};
        if (this.props.action === "edit-info" && !isEmpty(this.props.project)) {
            project.name = this.props.project.name;
            project.description = this.props.project.description;
        } else if (this.props.action === "edit-users" && !isEmpty(this.props.project)) {
            project.users = this.props.project.users.map(user => user._id);
        }
        this.state = {
            project : project,
            users : []
        }
    }

    componentDidMount(){
        axios.get('/users')
            .then(res => {
                if (res.data.length > 0) {
                    this.setState({
                        users : res.data,
                    });
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    componentDidUpdate(prevProps){   
        if (this.props.project != prevProps.project) {
            if (this.props.action === "edit-info") {
                let project = this.state.project || {};
                project.name = this.props.project.name;
                project.description = this.props.project.description;
                    
                this.setState({
                    project : project,
                });

            } else if (this.props.action === "edit-users") {
                let project = this.state.project || {};
                project.users = this.props.project.users.map(user => user._id);
                    
                this.setState({
                    project : project,
                });
            }
        }
    }

    changeName(event){
        let project = this.state.project;
        project.name = event.target.value;

        this.setState({
            project : project
        })
    }

    changeDescription(event){
        let project = this.state.project;
        project.description = event.target.value;

        this.setState({
            project : project
        })
    }

    changeCheckbox(user){
        let project = this.state.project;

        if (isEmpty(project.users)) {
            project.users = [user._id];
        } else {
            let userIndex = project.users.findIndex(projectUser => projectUser === user._id);

            if (userIndex != -1) {
                project.users.splice(userIndex, 1);
            } else {
                project.users.push(user._id);
            }
        }
  
        this.setState({
            project : project
        })
    }

    handleAction(){
        if (this.props.action === "edit-info") {
            if (isEmpty(this.state.project.name) || isEmpty(this.state.project.description)) {
                alert("Please fill in all the fields");
                return;
            }
            
            let project = this.props.project;
            project.name = this.state.project.name;
            project.description = this.state.project.description;
            this.props.onAction(project);
            this.props.onClose();

        } else if (this.props.action === "edit-users") {
            if (isEmpty(this.state.project.users)) {
                alert("Please select at least one user");
                return;
            }
            
            let project = this.props.project;
            project.users = this.state.project.users;
            this.props.onAction(project);
            this.props.onClose();

        } else if (this.props.action === "add-project") {
            let project = this.state.project;
            if (isEmpty(project.name) || isEmpty(project.description) || isEmpty(project.users)) {
                alert("Please fill in all the fields");
                return;
            }

            this.props.onAction(project);
            this.props.onClose();
            this.setState({
                project: {}
            })
        }
    }

 
    render(){
        let projectInfo = "";
        let users = "";

        if (this.props.action === "add-project" || this.props.action === "edit-info") {
            projectInfo = <div>
                            <TextField margin="dense" id="project-name-input" label="Name" autoComplete={"off"} 
                                defaultValue={this.state.project.name} 
                                onChange={(event) => this.changeName(event)} fullWidth />
                            <TextField margin="dense" id="project-description-input" label="Description" autoComplete={"off"} 
                                defaultValue={this.state.project.description} 
                                onChange={(event) => this.changeDescription(event)} fullWidth />
                        </div>
        }

        if (this.props.action === "add-project" || this.props.action === "edit-users") {
            let projectUsers = this.state.project.users || [];

            users = this.state.users;
            users.sort((a,b) => {
                if(a.firstName < b.firstName) { return -1; }
                if(a.firstName > b.firstName) { return 1; }
                return 0;
            })
            
            users = this.state.users.map((user) => {
                return(
                    <ListItem button key={user._id} onClick={() => this.changeCheckbox(user)}>
                        <ListItemAvatar style={{ marginRight: "1rem", }}>
                            <Avatar alt={user.firstName} src={isEmpty(user.avatar) ? "" : `../../../storage/users/${user._id}/${user.avatar}`}  className="user-avatar" />
                        </ListItemAvatar>
                        <ListItemText primary={user.fullName} />
                        <ListItemSecondaryAction>
                            <Checkbox checked={projectUsers.filter(projectUser => projectUser === user._id).length > 0 ? true : false} 
                                className="primary-color" onClick={() => this.changeCheckbox(user)} />
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            })

        }

        return(
            <Dialog open={this.props.open} onClose={() => this.props.onClose()} fullWidth={true} maxWidth={"xs"}>
                <DialogTitle>{this.props.action === "add-project" ? "Add Project" : "Edit Project"}</DialogTitle>
                        
                <DialogContent>
                    {projectInfo}

                    <List style={{ marginTop: "1.5rem", maxHeight: "300px", }}>
                        {users}
                    </List>
                </DialogContent>
                    
                <DialogActions>
                    <Button onClick={() => this.props.onClose()} className="primary-color">
                        Cancel
                    </Button>
                    <Button onClick={() => this.handleAction()} className="primary-color">
                        {this.props.action === "add-project" ? "Add" : "Edit"}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default ProjectDialog;