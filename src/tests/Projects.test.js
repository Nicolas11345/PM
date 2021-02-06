import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Projects, Project } from '../components/Projects'

import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';

import {
    Route,
} from "react-router-dom";

configure({ adapter: new Adapter() });

describe('<Projects />', () => {
    test('testing component rendering', () => {
        const match = {
            url : 'url',
            route : 'route'
        }

        const user = {
            _id : '1',
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            role : 'Administrator',
            avatar : ''
        }

        const projects = [
            {
                _id : '1',
            },
            {
                _id : '2',
            },
            {
                _id : '3',
            }
        ]

        const wrapper = shallow(<Projects user = {user} match = {match} />, { disableLifecycleMethods : true });

        wrapper.setState({ projects : projects });

        expect(wrapper.find(Route)).toHaveLength(2);
        expect(wrapper.find(Button)).toHaveLength(1);
        expect(wrapper.find(Project)).toHaveLength(3);
    });

    test('testing button action', () => {
        const match = {
            url : 'url',
            route : 'route'
        }

        const user = {
            _id : '1',
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            role : 'Administrator',
            avatar : ''
        }

        const wrapper = shallow(<Projects user = {user} match = {match} />, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        instance.openDialog = jest.fn();

        wrapper.update();

        wrapper.find(Button).simulate('click');
        expect(instance.openDialog).toHaveBeenCalled();
    });
});

describe('<Project />', () => {
    test('testing component rendering', () => {
        const project = {
            name : 'name',
            description : 'description',
            users : [
                {
                    _id : '1',
                    firstName : 'John',
                    lastName : 'Doe',
                    fullName : 'John Doe',
                    avatar : ''
                },
                {
                    _id : '2',
                    firstName : 'John',
                    lastName : 'Doe',
                    fullName : 'John Doe',
                    avatar : ''
                },
                {
                    _id : '3',
                    firstName : 'John',
                    lastName : 'Doe',
                    fullName : 'John Doe',
                    avatar : ''
                }
            ]
        }

        const wrapper = shallow(<Project project = {project} />, { disableLifecycleMethods : true });

        expect(wrapper.find('.app-card-title').find('h2').text()).toEqual(project.name);
        expect(wrapper.find('span').text()).toEqual(project.description);
        expect(wrapper.find(Avatar)).toHaveLength(3);
    });
});