import React from 'react';
import Axios from 'axios';
import Chart from 'chart.js';
import Grid from '@material-ui/core/Grid';
import 'chartjs-plugin-colorschemes';

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

export class Home extends React.Component{
    constructor(props){
       super(props);
    }

    componentDidMount(){
        axios.get('/tasks')
            .then(res => {
                if (res.data.length > 0) {
                    let tasks = res.data;

                    let users = [];
                    let usersCounts = [];
                    let projects = [];
                    let projectsCounts = [];
                    let priority = ["Low", "Normal", "High"];
                    let priorityCounts = [0, 0, 0];
                    let status = ["In Progress", "Late", "Done"];
                    let statusCounts = [0, 0, 0];                   

                    for (let task of tasks) {
                        if (!users.includes(task.assignee.fullName)) {
                            users.push(task.assignee.fullName);
                            usersCounts.push(1);
                        } else {
                            usersCounts[users.indexOf(task.assignee.fullName)] += 1;
                        }

                        if (!projects.includes(task.project.name)) {
                            projects.push(task.project.name);
                            projectsCounts.push(1);
                        } else {
                            projectsCounts[projects.indexOf(task.project.name)] += 1;
                        }

                        priorityCounts[priority.indexOf(task.priority)] += 1;
                        statusCounts[status.indexOf(task.status)] += 1;
                    }

                    let ctxUsers = document.getElementById("users-chart");
                    let ctxProjects = document.getElementById("projects-chart");
                    let ctxPriority = document.getElementById("priority-chart");
                    let ctxStatus = document.getElementById("status-chart");

                    let usersChart = new Chart(ctxUsers, {
                        type: "doughnut",
                        data: {
                            labels: users,
                            datasets: [{
                                data: usersCounts,                             
                            }]
                        },
                        options: {
                            legend: {
                                position: "bottom"
                            },
                            plugins: {
                                colorschemes: {
                                    scheme: 'tableau.Tableau10'
                                }
                            }
                        },
                    });

                    let projectsChart = new Chart(ctxProjects, {
                        type: "doughnut",
                        data: {
                            labels: projects,
                            datasets: [{
                                data: projectsCounts,                              
                            }]
                        },
                        options: {
                            legend: {
                                position: "bottom"
                            },
                            plugins: {
                                colorschemes: {
                                    scheme: 'tableau.Tableau10'
                                }
                            }
                        },
                    });

                    let priorityChart = new Chart(ctxPriority, {
                        type: "bar",
                        data: {
                            labels: priority,
                            datasets: [{
                                data: priorityCounts,
                                backgroundColor: [
                                    "rgba(54, 162, 235, 1)",
                                    "rgba(75, 192, 192, 1)",
                                    "rgba(255, 99, 132, 1)",
                                ],                            
                            }]
                        },
                        options: {
                            legend: {
                                display: false
                            },
                            scales: {
                                xAxes: [{
                                    gridLines: {
                                        color: "rgba(0, 0, 0, 0)",
                                    }
                                }],
                                yAxes: [{
                                    gridLines: {
                                        color: "rgba(0, 0, 0, 0)",
                                    },
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            },
                        },
                    });

                    let statusChart = new Chart(ctxStatus, {
                        type: "bar",
                        data: {
                            labels: status,
                            datasets: [{
                                data: statusCounts,
                                backgroundColor: [
                                    "rgba(54, 162, 235, 1)",
                                    "rgba(255, 99, 132, 1)",
                                    "rgba(75, 192, 192, 1)",
                                ],                                
                            }]
                        },
                        options: {
                            legend: {
                                display: false
                            },
                            scales: {
                                xAxes: [{
                                    gridLines: {
                                        color: "rgba(0, 0, 0, 0)",
                                    }
                                }],
                                yAxes: [{
                                    gridLines: {
                                        color: "rgba(0, 0, 0, 0)",
                                    },
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            },
                        },
                    });
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }
 
    render(){
        return(
            <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                    <div className="app-card">
                        <div className="app-card-title">
                            <h3>Tasks by Users</h3>
                        </div>
                        <canvas id="users-chart"></canvas>
                    </div>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <div className="app-card">
                        <div className="app-card-title">
                            <h3>Tasks by Projects</h3>
                        </div>
                        <canvas id="projects-chart"></canvas>
                    </div>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <div className="app-card">
                        <div className="app-card-title">
                            <h3>Tasks by Priority</h3>
                        </div>
                        <canvas id="priority-chart"></canvas>
                    </div>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <div className="app-card">
                        <div className="app-card-title">
                            <h3>Tasks by Status</h3>
                        </div>
                        <canvas id="status-chart"></canvas>
                    </div>
                </Grid>
            </Grid> 
        );
    }
}

export default Home;