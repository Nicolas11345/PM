import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Tasks } from '../components/Tasks'

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
    Route,
} from "react-router-dom";

configure({ adapter: new Adapter() });

describe('<Tasks />', () => {
    test('testing component rendering', () => {
        const match = {
            url : 'url',
            route : 'route'
        }

        const project = {
            _id : '1',
            name : 'project'
        }

        const submitter1 = {
            _id : '1',
            fullName : 'John Doe'
        }

        const submitter2 = {
            _id : '2',
            fullName : 'John2 Doe2'
        }

        const submitter3 = {
            _id : '3',
            fullName : 'John3 Doe3'
        }

        const tasks = [
            {
                _id : '1',
                title : 'Title 1',
                project : project,
                submitter : submitter1,
                priority : 'Normal',
                status : 'Open',
                created : new Date(),
                due : Date(),
            },
            {
                _id : '2',
                title : 'Title 2',
                project : project,
                submitter : submitter2,
                priority : 'High',
                status : 'Open',
                created : new Date()
            },
            {
                _id : '3',
                title : 'Title 3',
                project : project,
                submitter : submitter3,
                priority : 'Low',
                status : 'Closed',
                created : new Date()
            }
        ]

        const wrapper = shallow(<Tasks match = {match} />, { disableLifecycleMethods : true });

        wrapper.setState({ tasks : tasks });

        expect(wrapper.find(Route)).toHaveLength(2);
        expect(wrapper.find(Table)).toHaveLength(1);
        expect(wrapper.find(TableRow)).toHaveLength(5);
        expect(wrapper.find(TableRow).at(1).find(TableCell).first().text()).toEqual(tickets[0].title);
    });
});

