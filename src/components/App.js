import React from 'react';
import Axios from 'axios';
import Home from './Home'
import Users from './Users';
import Projects from './Projects';
import Tasks from './Tasks';
import Profile from './Profile';
import { isEmpty, formatDate } from '../utils'

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';
import HomeIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/People';
import FolderIcon from '@material-ui/icons/Folder';
import AssignmentIcon from '@material-ui/icons/Assignment';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation
} from "react-router-dom";

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

export function Sections(props) {
    let location = useLocation();

    return(
        <List component="nav">
            <ListItem button className={(location.pathname === "/" ? "nav-item active-section" : "nav-item")} component={Link} to="/">
                <ListItemIcon>
                    <HomeIcon style={{ color: "#bfc6ec", }} />
                </ListItemIcon>
                <ListItemText primary="Home" primaryTypographyProps={{ style: { fontSize: "1.1rem", }, }} />
            </ListItem>

            {props.user.role === "Administrator" ? (
            <ListItem button className={(location.pathname.startsWith("/users") ? "nav-item active-section" : "nav-item")} component={Link} to="/users">
                <ListItemIcon>
                    <PeopleIcon style={{ color: "#bfc6ec", }} />
                </ListItemIcon>
                <ListItemText primary="Users" primaryTypographyProps={{ style: { fontSize: "1.1rem", }, }} />
            </ListItem>) : ""}

            <ListItem button className={(location.pathname.startsWith("/projects") ? "nav-item active-section" : "nav-item")} component={Link} to="/projects">
                <ListItemIcon>
                    <FolderIcon style={{ color: "#bfc6ec", }} />
                </ListItemIcon>
                <ListItemText primary="Projects" primaryTypographyProps={{ style: { fontSize: "1.1rem", }, }} />
            </ListItem>

            <ListItem button className={(location.pathname.startsWith("/tasks") ? "nav-item active-section" : "nav-item")} component={Link} to="/tasks">
                <ListItemIcon>
                    <AssignmentIcon style={{ color: "#bfc6ec", }} />
                </ListItemIcon>
                <ListItemText primary="Tasks" primaryTypographyProps={{ style: { fontSize: "1.1rem", }, }} />
            </ListItem>
        </List>
    );
}

export class SideBar extends React.Component{
    constructor(props){
        super(props);
    }
 
    render(){
        return(
            <div className="sidebar">
                <div className="app-logo">
                   PM
                </div>
            
                <div className="sidebar-content">
                    <Sections user = {this.props.user} />
                </div>
           </div>
       );
    }
}

export class AppBar extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            anchorEl1 : null,
            anchorEl2 : null,
        }
    }

    openNotifMenu(event){
        this.setState({
            anchorEl1 : event.currentTarget
        });
    }
  
    closeNotifMenu(){
        this.setState({
            anchorEl1 : null
        });
    }

    openProfileMenu(event){
        this.setState({
            anchorEl2 : event.currentTarget
        });
    }
  
    closeProfileMenu(){
        this.setState({
            anchorEl2 : null
        });
    }

    deleteNotifications(){
        let user = this.props.user;
        user.notifications = [],

        axios.post('/users/' + user._id, user)
            .then(res => {
                this.props.onChange();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    logOut(){
        axios.get('/logout')
            .then(res => {
                window.location="/";
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }
 
    render(){
        let user = this.props.user || {};
        let notifications = user.notifications || [];

        let notificationsReversed = [];
        for (let i=notifications.length-1; i>=0; i--) {
            notificationsReversed.push(notifications[i]);
        }
        notifications = notificationsReversed;

        notifications = notifications.map((notification) => {
            if (notification.section === "Users") {
                return(
                    <ListItem key={notification._id}>
                        <ListItemAvatar>
                            <Avatar>
                                <PeopleIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={notification.message} secondary={formatDate(notification.date)} />
                    </ListItem>
                );
            } else if (notification.section === "Projects") {
                return(
                    <ListItem key={notification._id}>
                        <ListItemAvatar>
                            <Avatar>
                                <FolderIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={notification.message} secondary={formatDate(notification.date)} />
                    </ListItem>
                );
            } else if (notification.section === "Tasks") {
                return(
                    <ListItem key={notification._id}>
                        <ListItemAvatar>
                            <Avatar>
                                <AssignmentIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={notification.message} secondary={formatDate(notification.date)} />
                    </ListItem>
                );
            } 
        })

        return(
            <div className="app-bar">
                <div className="app-bar-content">
                    <div className="app-bar-notifications">
                        <IconButton onClick = {(event) => this.openNotifMenu(event)}>
                            <Badge badgeContent={notifications.length} color="secondary" className="notifications-badge"
                                 invisible={notifications.length > 0 ? false : true}>
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </div>
                
                    <div className="app-bar-profile">
                        <Avatar className="app-bar-profile-avatar" alt={user.firstName} 
                            src={isEmpty(user.avatar) ? "" : `../../storage/users/${user._id}/${user.avatar}`} />

                        <span className="app-bar-profile-name" onClick = {(event) => this.openProfileMenu(event)}>
                            <span>{user.fullName}</span>
                            <KeyboardArrowDownIcon />
                        </span>
                    </div>

                    <Menu anchorEl={this.state.anchorEl1} getContentAnchorEl={null} keepMounted 
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} transformOrigin={{ vertical: "top", horizontal: "center" }}
                        open={Boolean(this.state.anchorEl1)} onClose={() => this.closeNotifMenu()}
                        PaperProps={{ style: {
                                        padding: "0px",
                                        maxHeight: "25rem",
                                        width: "18rem",
                                    }, }}>
                        <Paper className="notifications-menu">
                            <div className="notifications-header">
                                <h5>Notifications</h5>
                                <span className="notifications-clear-all" onClick = {() => this.deleteNotifications()}>Clear all</span>
                            </div>

                            <List>
                                {notifications}
                            </List>
                        </Paper>
                    </Menu>

                    <Menu anchorEl={this.state.anchorEl2} getContentAnchorEl={null} keepMounted 
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} transformOrigin={{ vertical: "top", horizontal: "center" }}
                        open={Boolean(this.state.anchorEl2)} onClose={() => this.closeProfileMenu()}
                        PaperProps={{ style: { width: "8rem", }, }}>
                        <MenuItem component={Link} to="/profile" onClick={() => this.closeProfileMenu()}>Profile</MenuItem>
                        <MenuItem onClick={() => this.logOut()}>Logout</MenuItem>
                    </Menu>
                </div>
            </div>
       );
    }
}

export class AppContent extends React.Component{
    constructor(props){
        super(props);
    }
 
    render(){
        return(
            <div id="app-content">
                <AppBar user = {this.props.user} onChange = {() => this.props.onChange()} /> 
 
                <div className ="section-content">
                    <Switch>
                        <Route exact path="/">  
                            <h2 className="section-title">Home</h2>
                            <Home />
                        </Route>
                        <Route path="/users">
                            <h2 className="section-title">Users</h2>
                            <Users user = {this.props.user} onChange = {() => this.props.onChange()} />
                        </Route>
                        <Route path="/projects">
                            <h2 className="section-title">Projects</h2>
                            <Projects user = {this.props.user} onChange = {() => this.props.onChange()} />
                        </Route>
                        <Route path="/tasks">
                            <h2 className="section-title">Tasks</h2>
                            <Tasks user = {this.props.user} onChange = {() => this.props.onChange()} />
                        </Route>
                        <Route path="/profile">
                            <h2 className="section-title">Profile</h2>
                            <Profile user = {this.props.user} onChange = {() => this.props.onChange()} />
                        </Route>
                    </Switch>
                </div>
            </div>
       );
    }
}

export class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user : {}
        }
    }

    componentDidMount(){
        this.getUser();
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

    updateApp(){
        this.getUser();
    }
 
    render(){
        return(
            <Router>
                <div id="app-container">
                    <Grid container>
                        <Grid item xs={2}>
                            <SideBar user = {this.state.user} />
                        </Grid>
                        <Grid item xs={10}>
                            <AppContent user = {this.state.user} onChange = {() => this.updateApp()} />
                        </Grid>
                    </Grid> 
                </div>
            </Router>
       );
    }
}

export default App;