import React from 'react';
import Axios from 'axios';
import TaskPage from './utils/TaskPage'
import { formatDate } from '../utils'

import Grid from '@material-ui/core/Grid';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
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
            <IconButton component={Link} to={`${url}/${props.task._id}`}>
                <EditIcon />
            </IconButton>
        </Tooltip>
    );
}

export class Tasks extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tasks : [],
            page : 0,
            rowsPerPage : 5
        }
    }

    componentDidMount(){
        this.getTasks();
    }

    getTasks(){
        axios.get('/tasks/user/' + this.props.user._id)
            .then(res => {
                if (res.data.length > 0) {
                    this.props.onChange()
                    this.setState({
                        tasks : res.data,
                    });
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
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
        let { path, url } = this.props.match;

        let tasks = this.state.tasks || [];
        let count = tasks.length;
        let page = this.state.page;
        let rowsPerPage = this.state.rowsPerPage;

        tasks = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task) => {
            return(
                <TableRow hover={true} key={task._id}>
                    <TableCell style={{ width: "16%", }}>{task.title}</TableCell>
                    <TableCell align="right" style={{ width: "13%", }}>{task.project.name}</TableCell>
                    <TableCell align="right" style={{ width: "13%", }}>{task.submitter.fullName}</TableCell>
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
            <Switch>
                <Route path={`${path}/:id`}>
                    <TaskPage previousPage = {url} onChange = {() => this.getTasks()} />
                </Route>

                <Route exact path={path}>
                    <Grid container>
                        <Grid item xs={12}>  
                            <div className="app-card">
                                <TableContainer>
                                    <Table className="tasks-table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ width: "16%", }}>Title</TableCell>
                                                <TableCell align="right" style={{ width: "13%", }}>Project</TableCell>
                                                <TableCell align="right" style={{ width: "13%", }}>Submitter</TableCell>
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
                    </Grid>  
                </Route>    
            </Switch>
        );
    }
}

export default withRouter(Tasks);